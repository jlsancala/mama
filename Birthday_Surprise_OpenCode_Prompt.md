# OpenCode Prompt — Birthday Surprise Greeting

Build a personal birthday greeting page called **A Little Surprise for You**. Create `index.html` and `styles.css` in the project folder. The page must work offline when I open `index.html` directly in a browser. Use only HTML and CSS. Do not use JavaScript, inline event handlers, frameworks, external fonts, remote images, or build tools.

## The surprise

1. Start with a midnight-purple background and a sealed envelope with a gold wax seal. Show only the teaser “For Mama Analy” and the invitation “Open your surprise.” Keep the cake, birthday headline, and personal message hidden until the envelope is opened.
2. Use a native `<details>` and `<summary>` for the envelope interaction so it works with touch, mouse, and keyboard. Use the `[open]` state to lift the envelope flap and reveal the greeting card. Update the visible trigger text to “Close your surprise” while open.
3. On reveal, show an animated CSS-only celebration. Let a short burst of confetti play behind the card, then reveal a small CSS birthday cake with a softly flickering candle above the heading “Happy Birthday, Mama Analy!” Keep the message readable while the animation plays.
4. Add a second, optional reveal inside the opened card with a separate native disclosure labeled “One last wish.” Inside, show “Make a wish, Ma. Mine is that this year gives you more time for the things you love.” Keep it usable even if the recipient opens it before the first animation finishes.

## Card copy

> Happy Birthday, Mama Analy!
>
> Ma, thank you for taking care of me in so many ways, even the little ones I forget to say thank you for. I hope today you get to put your feet up, eat something you love, and let us spoil you for a change. I love you, Ma.
>
> Love, your son, John Louis J. Sancala

Add an HTML comment near the top that points out where to customize the recipient name, sender name, message, and final wish.

## Design and behavior

- Use midnight purple, warm gold, and soft blush with a cream greeting card. Use system fonts, a clear type hierarchy, and generous spacing.
- Build the envelope, cake, candle, confetti, and simple stars with CSS shapes, gradients, and pseudo-elements. Keep decorative elements out of the accessibility tree and make confetti ignore pointer events.
- Lay out the card in normal document flow so longer messages can scroll on small screens. Make it fit at 320 px wide without horizontal scrolling.
- Give both disclosure controls visible keyboard focus and comfortable touch targets. Keep text contrast strong. Respect `prefers-reduced-motion` by disabling animations and showing the complete greeting immediately after opening.
- Define theme colors in CSS custom properties so I can change the palette easily.

## Before finishing

Verify that the first screen keeps the greeting hidden, the envelope opens and closes, both reveals work by keyboard, and the page remains readable at mobile and desktop widths. Check that reduced motion still leaves every message available. Tell me which files you created and where to edit the names and message.
