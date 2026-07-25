/**
 * NotificationService
 * 
 * Handles push notifications across multiple pluggable channels.
 * Currently supports Socket.io and a stub for WhatsApp Cloud API.
 */

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Send a notification to a specific user or room
   * @param {string} to - user_id or department room name
   * @param {string} templateName - The identifier for the message template
   * @param {object} params - Dynamic parameters for the template
   */
  async send(to, templateName, params) {
    const payload = this._buildPayload(templateName, params);
    
    // 1. Send via WebSockets (Real-time UI push)
    if (this.io) {
      // If 'to' is a number, treat as user ID room, else treat as department room
      const room = typeof to === 'number' ? `user_${to}` : `dept_${to}`;
      this.io.to(room).emit('notification', payload);
    }

    // 2. Send via WhatsApp (Stubbed)
    await this._sendWhatsAppStub(to, payload);
  }

  _buildPayload(templateName, params) {
    let title = 'New Notification';
    let body = '';

    switch (templateName) {
      case 'TRIP_ASSIGNED':
        title = 'New Trip Assigned';
        body = `Pick up patient from Cabin ${params.cabinNumber} -> ${params.destination}`;
        break;
      case 'INCOMING_PATIENT':
        title = 'Patient Incoming';
        body = `Patient en route from ${params.origin} -> ${params.destination}`;
        break;
      case 'UNASSIGNED_TRIP_ALERT':
        title = 'Unassigned Trip Alert';
        body = `Trip requested for Cabin ${params.cabinNumber} but no escorts are available.`;
        break;
      default:
        body = JSON.stringify(params);
    }

    return { title, body, timestamp: new Date(), type: templateName, data: params };
  }

  async _sendWhatsAppStub(to, payload) {
    // In the future, wire this to WhatsApp Cloud API via Axios
    // Example: axios.post('https://graph.facebook.com/v17.0/PHONE_ID/messages', ...)
    console.log(`\n[WhatsApp Stub] 📱 Sending message to: ${to}`);
    console.log(`[WhatsApp Stub] Title: ${payload.title}`);
    console.log(`[WhatsApp Stub] Body: ${payload.body}\n`);
  }
}

module.exports = NotificationService;
