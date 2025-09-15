import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function sendNewsletter(subject: string, htmlContent: string, recipients: { email: string }[]) {
  try {
    const promises = recipients.map(recipient => {
      const unsubscribeUrl = `${import.meta.env.PUBLIC_BASE_URL}/unsubscribe?token=${recipient.email}`;
      const unsubscribableHtmlContent = htmlContent + `<br><p><a href="${unsubscribeUrl}">Cancelar subscripción</a></p>`;

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
