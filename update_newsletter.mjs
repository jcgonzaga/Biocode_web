import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- Dotenv setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// --- Supabase Client ---
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: node update_newsletter.mjs <newsletter_id> <file_path>');
        process.exit(1);
    }

    const [newsletterId, filePath] = args;
    const absoluteFilePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absoluteFilePath)) {
        console.error(`File not found: ${absoluteFilePath}`);
        process.exit(1);
    }

    const newsletterHtml = fs.readFileSync(absoluteFilePath, 'utf-8');

    const { data, error } = await supabase
        .from('newsletters')
        .update({ content_html: newsletterHtml })
        .eq('id', newsletterId)
        .select();

    if (error) {
        console.error('Error updating newsletter:', error);
        return;
    }

    console.log('Newsletter updated successfully:', data);
}

main();
