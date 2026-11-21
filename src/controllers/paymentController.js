import Stripe from 'stripe';
import Appointment from '../models/Appointment.js';
import Transaction from '../models/Transaction.js';

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';
  return new Stripe(secretKey);
};

// @desc    Create Stripe Checkout Session for a confirmed appointment
// @route   POST /api/payments/create-checkout-session
// @access  Private/Customer
export const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate('serviceId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Customer can only pay for their own appointments
    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment attempt for this appointment.',
      });
    }

    // Rule: "Customers cannot pay for cancelled or pending appointments"
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Payment is only allowed for confirmed appointments. Current status: ${appointment.status}.`,
      });
    }

    // Check if already paid
    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been paid for.',
      });
    }

    const stripe = getStripeInstance();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: appointment.serviceId?.serviceName || 'Salon Service Appointment',
              description: `Appointment on ${appointment.appointmentDate} at ${appointment.timeSlot}`,
              images: appointment.serviceId?.image ? [appointment.serviceId.image] : [],
            },
            unit_amount: Math.round(appointment.servicePrice * 100), // Stripe in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointment._id.toString(),
        customerId: req.user._id.toString(),
      },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel?appointment_id=${appointment._id.toString()}`,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate Stripe Checkout session.',
    });
  }
};

// @desc    Handle Stripe Webhook for verified payment events
// @route   POST /api/payments/webhook
// @access  Public (Signature Verified)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripe = getStripeInstance();
  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In local dev without webhook secret, parse payload directly
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error(`[Webhook Verification Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { appointmentId, customerId } = session.metadata || {};

    if (appointmentId) {
      try {
        // Update appointment paymentStatus to 'paid'
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
          appointment.paymentStatus = 'paid';
          await appointment.save();

          // Check if transaction record already exists for this session to prevent duplicate
          const existingTx = await Transaction.findOne({ stripeSessionId: session.id });
          if (!existingTx) {
            await Transaction.create({
              appointmentId: appointment._id,
              customerId: customerId || appointment.customerId,
              amount: session.amount_total ? session.amount_total / 100 : appointment.servicePrice,
              currency: session.currency || 'usd',
              stripeSessionId: session.id,
              status: 'paid',
            });
          }
          console.log(`[Stripe Webhook]: Appointment ${appointmentId} payment recorded successfully.`);
        }
      } catch (dbError) {
        console.error(`[Webhook DB Error]: ${dbError.message}`);
      }
    }
  }

  res.status(200).json({ received: true });
};

// @desc    Verify session status after redirect (fallback & details view)
// @route   GET /api/payments/verify-session/:sessionId
// @access  Private
export const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.appointmentId) {
      const appointment = await Appointment.findById(session.metadata.appointmentId)
        .populate('serviceId')
        .populate('customerId', 'name email');

      // Update appointment if webhook hasn't processed it yet
      if (appointment && appointment.paymentStatus !== 'paid') {
        appointment.paymentStatus = 'paid';
        await appointment.save();

        const existingTx = await Transaction.findOne({ stripeSessionId: session.id });
        if (!existingTx) {
          await Transaction.create({
            appointmentId: appointment._id,
            customerId: appointment.customerId._id,
            amount: session.amount_total / 100,
            currency: session.currency || 'usd',
            stripeSessionId: session.id,
            status: 'paid',
          });
        }
      }

      return res.json({
        success: true,
        session,
        appointment,
      });
    }

    res.json({
      success: false,
      message: 'Payment session is not completed or unpaid.',
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify session.',
    });
  }
};

// @desc    Get all transactions for Admin audit
// @route   GET /api/payments/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('customerId', 'name email phone')
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'serviceId',
          select: 'serviceName category price',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve transactions.',
    });
  }
};
