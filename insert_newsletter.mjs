import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Service Key is missing. Make sure to set them in your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 3) {
        console.error('Usage: node insert_newsletter.mjs <subject> <file_path> <image_url>');
        process.exit(1);
    }

    const [subject, filePath, imageUrl] = args;
    const absoluteFilePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absoluteFilePath)) {
        console.error(`File not found: ${absoluteFilePath}`);
        process.exit(1);
    }

    const newsletterHtml = fs.readFileSync(absoluteFilePath, 'utf-8');

    const { data, error } = await supabase
        .from('newsletters')
        .insert([{
            subject: subject,
            content_html: newsletterHtml,
            publication_date: new Date(),
            image_url: imageUrl
        }])
        .select();

    if (error) {
        console.error('Error inserting newsletter:', error);
        return;
    }

    console.log('Newsletter inserted successfully:', data);
}

main();