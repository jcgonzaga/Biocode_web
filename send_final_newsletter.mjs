import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- Dotenv setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// --- Clients ---
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: node send_final_newsletter.mjs <newsletter_id>');
        process.exit(1);
    }
    const newsletterId = args[0];

    // 1. Fetch newsletter
    const { data: newsletter, error: newsletterError } = await supabase
        .from('newsletters')
        .select('subject, content_html')
        .eq('id', newsletterId)
        .single();

    if (newsletterError || !newsletter) {
        console.error('Newsletter not found:', newsletterError);
        process.exit(1);
    }

    // 2. Fetch subscribers
    const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('email, unsubscribe_token');

    if (subscribersError || !subscribers || subscribers.length === 0) {
        console.error('No subscribers found:', subscribersError);
        process.exit(1);
    }

    // 3. Send emails
    console.log(`Sending newsletter "${newsletter.subject}" to ${subscribers.length} subscribers...`);

    const promises = subscribers.map(subscriber => {
        const unsubscribeUrl = `${process.env.PUBLIC_BASE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
        const unsubscribableHtmlContent = newsletter.content_html.replace('[UNSUBSCRIBE_URL]', unsubscribeUrl);

        return resend.emails.send({
            from: 'Biocode Newsletter <newsletter@biocode.es>',
            to: subscriber.email,
            subject: newsletter.subject,
            html: unsubscribableHtmlContent,
            headers: {
                'List-Unsubscribe': unsubscribeUrl,
            },
        });
    });

    const results = await Promise.allSettled(promises);

    let successCount = 0;
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`Email sent to ${subscribers[index].email}`);
            successCount++;
        } else {
            console.error(`Failed to send email to ${subscribers[index].email}:`, result.reason);
        }
    });

    console.log(`\nFinished. ${successCount}/${subscribers.length} emails sent successfully.`);
}

main();
