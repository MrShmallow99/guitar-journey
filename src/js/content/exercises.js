// Exercise library for the practice planner (slide 10). Each exercise is
// drawn from what the deck teaches on slides 4-9, and states concrete
// steps plus an observable success criterion. `levels` is the range of
// self-ratings (1-5) the exercise suits; `goals` (optional) marks
// exercises preferred for a particular goal.

// LTR isolate for numbers, tempos and English terms inside Hebrew text.
// Unicode isolates (not <bdi>) so the same strings work in the DOM and in
// the plain-text copy of the plan.
export const ltr = (s) => `⁦${s}⁩`;

export const GOALS = [
  { id: 'general', name: 'התפתחות כללית', short: 'כללי' },
  { id: 'rhythm', name: 'קצב ותזמון', short: 'קצב' },
  { id: 'lead', name: 'נגינת סולו', short: 'סולו' },
  { id: 'songs', name: 'ללמוד שירים', short: 'שירים' },
  { id: 'improv', name: 'אלתור', short: 'אלתור' },
];

export const DURATIONS = [15, 30, 45, 60];

export const EXERCISES = [
  // ---- technique (slides 4, 6)
  {
    id: 'tech-alt-picking', skill: 'technique', levels: [1, 2], slide: 4,
    title: 'פריטה מתחלפת על מיתר אחד',
    steps: [`תו אחד על מיתר G, בשמיניות (למטה-למעלה), עם מטרונום ב-${ltr('60 BPM')}.`, 'בדקו כל חצי דקה: כתפיים, אגודל ויד הפריטה — רפויים?'],
    success: 'דקה רצופה בלי פספוס פריטה ובלי מתח ביד.',
  },
  {
    id: 'tech-chromatic', skill: 'technique', levels: [3, 3], slide: 4,
    title: `כרומטי ${ltr('1-2-3-4')} עם מטרונום`,
    steps: [`אצבע לכל סריג (סריגים ${ltr('5–8')}) על כל ששת המיתרים, בפריטה מתחלפת.`, `אחרי שלוש חזרות נקיות — העלו ב-${ltr('4 BPM')}.`],
    success: 'שלוש חזרות נקיות ברצף בקצב היעד.',
  },
  {
    id: 'tech-bursts', skill: 'technique', levels: [4, 5], slide: 6,
    title: 'פרצי מהירות (bursts)',
    steps: ['קבוצה של 4–6 תווים במהירות גבוהה — ועצירה מלאה.', 'שמרו על אותו רפיון כמו בקצב איטי; הוסיפו תו לפרץ רק כשהוא נקי.'],
    success: 'בהקלטה, הפרץ נשמע אחיד ונקי.',
  },
  {
    id: 'tech-bends', skill: 'technique', levels: [1, 3], slide: 6, goals: ['lead'],
    title: 'בנד לגובה יעד (bend)',
    steps: ['נגנו את התו שנמצא שני סריגים מעל — זה היעד.', 'חזרו לסריג הנמוך וכופפו עד שאתם מגיעים בדיוק ליעד, עם אצבע תומכת.'],
    success: 'חמישה בנדים ברצף שנשמעים ״בכוון״ מול תו היעד.',
  },
  {
    id: 'tech-vibrato', skill: 'technique', levels: [3, 5], slide: 6, goals: ['lead'],
    title: 'ויברטו מבוקר (vibrato)',
    steps: [`ויברטו על תו אחד בקצב קבוע: שתי תנודות לפעמה ב-${ltr('60 BPM')}.`, 'החליפו בין ויברטו צר לרחב בלי לאבד את הקצב.'],
    success: 'ויברטו אחיד שאתם מתחילים ועוצרים לפי בחירה.',
  },
  // ---- rhythm (slide 5)
  {
    id: 'rhy-eighths', skill: 'rhythm', levels: [1, 2], slide: 5,
    title: 'שמיניות עם מטרונום',
    steps: [`אקורד אחד, פריטה בשמיניות ב-${ltr('70 BPM')}. היד ממשיכה לזוז גם כשלא פוגעים במיתרים.`, 'ספרו בקול ״1 ו 2 ו 3 ו 4 ו״.'],
    success: 'דקה שלמה בלי להקדים או לאחר את הקליק.',
  },
  {
    id: 'rhy-subdivisions', skill: 'rhythm', levels: [3, 3], slide: 5,
    title: 'מעבר בין חלוקות (subdivisions)',
    steps: ['ארבע פעמות ברבעים, ארבע בשמיניות, ארבע בשלישיות — וחוזר חלילה.', 'הקליטו סבב אחד ובדקו שהפעמה לא זזה במעברים.'],
    success: 'שלושה סבבים רצופים בלי שהפעמה זזה.',
  },
  {
    id: 'rhy-two-four', skill: 'rhythm', levels: [4, 5], slide: 5,
    title: `הקליק על ${ltr('2')} ו-${ltr('4')}`,
    steps: [`כוונו את המטרונום לחצי מהקצב ושמעו את הקליק כפעמות ${ltr('2')} ו-${ltr('4')}.`, 'נגנו מעליו ריף או מקצב מוכר.'],
    success: 'שתי דקות שבהן הגרוב נשאר יציב.',
  },
  // ---- fretboard & theory (slide 7)
  {
    id: 'fb-note-names', skill: 'fretboard', levels: [1, 2], slide: 7,
    title: 'שמות התווים על מיתר E הנמוך',
    steps: [`מצאו ונגנו את כל ה-${ltr('A')}, ה-${ltr('C')} וה-${ltr('G')} על המיתר, ואמרו אותם בקול.`, 'בדקו את עצמכם מול הצוואר בשקף 7.'],
    success: 'מוצאים כל תו מבוקש תוך שלוש שניות בערך.',
  },
  {
    id: 'fb-intervals', skill: 'fretboard', levels: [3, 3], slide: 7, goals: ['lead', 'improv'],
    title: 'תנוחה 1 של הפנטטוניקה — עם מרווחים',
    steps: [`נגנו את התנוחה עולה ויורדת ואמרו את המרווח של כל תו (${ltr('1, b3, 4, 5, b7')}).`, 'עצרו על כל טוניקה ונגנו אותה פעמיים.'],
    success: 'התנוחה כולה, עם המרווחים בקול, בלי עצירות.',
  },
  {
    id: 'fb-connect', skill: 'fretboard', levels: [4, 5], slide: 7, goals: ['lead', 'improv'],
    title: 'חיבור שתי תנוחות',
    steps: ['נגנו משפט קצר שמתחיל בתנוחה 1 ונגמר בתנוחה 2.', 'חזרו על זה בכיוון ההפוך, ואז בין תנוחות 2 ו-3.'],
    success: 'מעבר חלק בין תנוחות באמצע משפט, בלי להסתכל.',
  },
  // ---- ear (slide 9)
  {
    id: 'ear-sing-find', skill: 'ear', levels: [1, 2], slide: 9,
    title: 'שירו — ומצאו על הגיטרה',
    steps: ['נגנו תו, שירו אותו, ואז מצאו אותו על מיתר אחר בלי להסתכל על הצוואר.', 'כשזה קל — עברו לצמדי תווים.'],
    success: 'פוגעים בתו הנכון ברוב הניסיונות.',
  },
  {
    id: 'ear-melody', skill: 'ear', levels: [3, 5], slide: 9,
    title: 'הוצאת מנגינה מהשמיעה',
    steps: ['בחרו מנגינה מוכרת ופשוטה. מצאו את התו הראשון, ואז תו אחר תו.', 'בדקו בטאב רק בסוף, אם בכלל.'],
    success: 'השורה הראשונה של המנגינה — בלי טאב.',
  },
  // ---- improvisation (slide 9)
  {
    id: 'imp-three-notes', skill: 'improv', levels: [1, 3], slide: 9,
    title: 'שלושה תווים, הרבה רווח',
    steps: ['מעל ג׳אם בלוז (backing track), השתמשו בשלושה תווים בלבד מתנוחה 1.', 'נגנו משפט קצר, ואז השאירו רווח באותו אורך — שאלה ותשובה.'],
    success: 'שומעים משפטים עם רווחים, לא רצף תווים.',
  },
  {
    id: 'imp-chord-tones', skill: 'improv', levels: [4, 5], slide: 9,
    title: 'נחיתה על תווי האקורד (chord tones)',
    steps: ['בכל החלפת אקורד בג׳אם, נחתו על תו מהאקורד החדש — למשל הטרצה.', 'נגנו לאט מספיק כדי לשמוע כל נחיתה.'],
    success: 'הנחיתות נשמעות ״נכונות״ בכל החלפה.',
  },
  // ---- repertoire (slide 9)
  {
    id: 'rep-loop', skill: 'repertoire', levels: [1, 2], slide: 9,
    title: 'הקטע הקשה, בלולאה',
    steps: ['בחרו ארבע תיבות קשות משיר שאתם לומדים ונגנו אותן לאט עם מטרונום.', 'כשהן נקיות — חברו את התיבה שלפני ואת התיבה שאחרי.'],
    success: 'שש התיבות ברצף, בלי לעצור.',
  },
  {
    id: 'rep-full-song', skill: 'repertoire', levels: [3, 5], slide: 9,
    title: 'שיר שלם, מההתחלה ועד הסוף',
    steps: ['נגנו שיר מהרפרטואר שלכם בלי לעצור על טעויות — כמו בהופעה.', 'סמנו את המקום שהכי חרק: זה התרגיל של מחר.'],
    success: 'השיר כולו, ברצף, בלי לעצור.',
  },
  // ---- creativity (slide 9)
  {
    id: 'cre-riff', skill: 'creativity', levels: [1, 5], slide: 9,
    title: 'ריף של שתי תיבות',
    steps: ['המציאו ריף קצר בתנוחה שאתם מכירים.', 'הקליטו אותו, ונגנו מעליו וריאציה אחת.'],
    success: 'ריף מוקלט ושמור, שאפשר לחזור אליו מחר.',
  },
  // ---- tone (slide 8)
  {
    id: 'tone-compare', skill: 'tone', levels: [1, 5], slide: 8,
    title: 'השוואת פיקאפים וווליום',
    steps: ['נגנו את אותו ריף בפיקאפ הצוואר, ואז בפיקאפ הגשר.', 'חזרו על זה בווליום מלא ובחצי ווליום.'],
    success: 'אתם מתארים את ההבדל במילים ובוחרים סאונד מכוון לקטע.',
  },
];

// Fixed blocks that frame every session.
export const WARMUP = {
  id: 'warmup', skill: null, slide: 4,
  title: 'חימום רפוי',
  steps: [`כרומטי איטי ${ltr('1-2-3-4')} על שני מיתרים, בלי מטרונום.`, 'בדקו כתפיים, אגודל ולחץ האצבעות — מינימום כוח שמפיק צליל נקי.'],
  success: 'הידיים חמות, והצליל נקי בלי ללחוץ חזק.',
};

export const REFLECT = {
  id: 'reflect', skill: null, slide: 10,
  title: 'הקלטה קצרה ומשפט אחד',
  steps: ['הקליטו דקה מבלוק היישום.', 'כתבו משפט אחד: מה השתפר היום, ועל מה עובדים מחר.'],
  success: 'יש הקלטה מתוארכת — להשוואה בעוד חודש.',
};

// The "apply it to music" block, per goal (slide 9: complete songs).
export const APPLICATIONS = {
  rhythm: {
    id: 'app-rhythm', skill: 'repertoire', slide: 5,
    title: 'שיר שלם עם מטרונום',
    steps: ['נגנו את חלק הליווי של שיר מוכר, עם מטרונום בקצב השיר (או לאט יותר).', 'שימו לב במיוחד למעברים בין חלקי השיר.'],
    success: 'השיר כולו בלי לאבד את הקליק.',
  },
  lead: {
    id: 'app-lead', skill: 'repertoire', slide: 6,
    title: 'שתי תיבות מסולו מוכר',
    steps: ['בחרו שתי תיבות מסולו שאתם אוהבים, ונגנו אותן לאט עם הבנדים והוויברטו המקוריים.', 'העלו קצב רק כשהבנדים בכוון.'],
    success: 'שתי התיבות נקיות, בקצב שבחרתם מראש.',
  },
  songs: null, // filled from the repertoire exercises by level (see planner.js)
  improv: {
    id: 'app-improv', skill: 'improv', slide: 9,
    title: 'אלתור מעל ג׳אם',
    steps: ['נגנו מעל ג׳אם בלוז (backing track) והשתמשו במה שתרגלתם בבלוק הממוקד.', 'הגבילו את עצמכם לתנוחה אחת.'],
    success: 'שלושה משפטים שאתם רוצים לשמוע שוב בהקלטה.',
  },
  general: null, // as songs
};
