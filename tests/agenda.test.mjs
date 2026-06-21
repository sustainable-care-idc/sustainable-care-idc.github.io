import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const agendaMatch = html.match(/<section id="agenda">([\s\S]*?)<\/section>/);

assert.ok(agendaMatch, 'agenda section should exist');
assert.match(html, /#agenda\s+\.agenda-table\s*>\s*:not\(caption\)\s*>\s*\*\s*>\s*\*\s*\{[\s\S]*?border:\s*1px\s+solid\s+var\(--bs-border-color\);/);
assert.match(agendaMatch[1], /<table class="[^"]*\bagenda-table\b[^"]*"/);

const sectionIds = [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(sectionIds, ['overview', 'organizers', 'agenda', 'cfp']);

const navHrefs = [...html.matchAll(/<a class="nav-link" href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(navHrefs, ['#overview', '#organizers', '#agenda', '#cfp']);

const entityMap = {
    '&amp;': '&',
    '&nbsp;': ' ',
    '&ndash;': '-',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&rsquo;': "'",
};

function normalizeCell(cellHtml) {
    return cellHtml
        .replace(/<li\b[^>]*>/g, ' | ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&(amp|nbsp|ndash|ldquo|rdquo|rsquo);/g, (entity) => entityMap[entity])
        .replace(/\s+/g, ' ')
        .trim();
}

const rows = [...agendaMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
    .map((rowMatch) => [...rowMatch[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cellMatch) => normalizeCell(cellMatch[1])))
    .filter((cells) => cells.length > 0);

assert.deepEqual(rows[0], ['Time', 'Activity and Description']);
assert.deepEqual(rows.slice(1), [
    [
        '09:00 - 09:20',
        'Welcome & Intros | Name | Institution / program / position | Research area & interests | What brings you to this workshop? | Fun facts',
    ],
    ['09:20 - 09:30', 'Workshop goal writing & sharing'],
    ['09:30 - 09:45', 'Workshop theme intro'],
    ['', '(form groups?)'],
    [
        '09:45 - 10:30',
        'Session #1: Sustainable vs. unsustainable care Example discussion questions: | How do you interpret "sustainable care?" | What does sustainable or unsustainable care look like in your research? | How do you define sustainability? | How do you define care? | What does sustainability, care, sustainable care, or unsustainable care look like outside your research?',
    ],
    ['10:30 - 11:00', 'Coffee break'],
    [
        '11:00 - 11:30',
        'Session #2: Sustainability, care, and sustainable care Example discussion questions: | What can we learn from these cases? | What experiences and practical knowledge can help support sustainable care? | What experiences and practical knowledge can help us intervene when care becomes unsustainable? | What can we do better as researchers? | What can we do better as adults?',
    ],
    [
        '11:30 - 12:00',
        "Session #3: Towards sustainable care in children's technology Example discussion questions: | How does technology support or undermine sustainable care? For whom, and how? | From sessions #1 and #2, what insights are transferable to the context of children and technology? | What other topics related to sustainable care did you want to discuss but did not get a chance to raise?",
    ],
    ['12:00 - 12:20', 'Workshop goal alignment & personal action item & reflection'],
    ['12:20 - 12:30', 'Closing remark // group photo!'],
]);

assert.equal(agendaMatch[1].includes('Workshop Agenda (TBU)'), false);
