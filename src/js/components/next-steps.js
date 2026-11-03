// Slide 11: turns the two weakest self-assessed skills into concrete
// next steps, each linking back to the slide that covers it.

import { ratings } from '../core/ratings.js';

export function initNextSteps(deck) {
  const box = document.getElementById('next-steps');

  function render() {
    box.replaceChildren();
    const h = document.createElement('h3');
    box.append(h);

    if (!ratings.rated) {
      h.textContent = 'הצעד הבא שלכם';
      const p = document.createElement('p');
      p.className = 'note';
      p.textContent = 'עוד לא דירגתם את עצמכם. דרגו את שמונת הכישורים, ונציע כאן שני צעדים ממוקדים.';
      const b = button('למפת הכישורים', 2);
      box.append(p, b);
      return;
    }

    h.textContent = 'הצעד הבא שלכם: שני תחומים לחיזוק';
    const ol = document.createElement('ol');
    for (const skill of ratings.weakest(2)) {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${skill.name} (${ratings.values[skill.id]}/5)`;
      const p = document.createElement('p');
      p.textContent = skill.tip;
      li.append(strong, p, button(`לשקף ${skill.slide}`, skill.slide));
      ol.append(li);
    }
    box.append(ol);
  }

  function button(label, slideNumber) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = label;
    b.addEventListener('click', () => deck.go(slideNumber - 1));
    return b;
  }

  ratings.addEventListener('change', render);
  render();
}
