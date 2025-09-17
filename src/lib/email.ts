import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function sendNewsletter(subject: string, htmlContent: string, recipients: { email: string, unsubscribe_token: string }[]) {
  try {
    const promises = recipients.map(recipient => {
      const unsubscribeUrl = `${import.meta.env.PUBLIC_BASE_URL}/unsubscribe?token=${recipient.unsubscribe_token}`;
      const unsubscribableHtmlContent = htmlContent.replace('[UNSUBSCRIBE_URL]', unsubscribeUrl);

      return resend.emails.send({
        from: 'Biocode Newsletter <newsletter@biocode.es>',
        to: recipient.email,
        subject: subject,
        html: unsubscribableHtmlContent,
        headers: {
          'List-Unsubscribe': unsubscribeUrl,
        },
      });
    });

    const results = await Promise.all(promises);

    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Resend errors:', errors);
      return { success: false, errors };
    }

    return { success: true, data: results.map(r => r.data) };

  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(recipientEmail: string, verificationToken: string) {
  try {
    const verificationUrl = `${import.meta.env.PUBLIC_BASE_URL}/api/verify?token=${verificationToken}`;
    const htmlContent = `
      <h1>Bienvenido a Biocode!</h1>
      <p>Gracias por subscribirte. Por favor, haz click en el siguiente enlace para confirmar tu subscripción:</p>
      <a href="${verificationUrl}">Confirmar Subscripción</a>
    `;

    const result = await resend.emails.send({
      from: 'Biocode Newsletter <newsletter@biocode.es>',
      to: recipientEmail,
      subject: 'Confirma tu subscripción a Biocode',
      html: htmlContent,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };

  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}
