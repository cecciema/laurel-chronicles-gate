import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { QuestTrigger, ScrollCollection, useGame } from "@/components/ChroniclesSystem";
import ParticleCanvas from "@/components/ParticleCanvas";
import heroBg from "@/assets/city.jpg";
import { isTouch } from "@/components/CustomCursor";

// ─── Typewriter Hook ───────────────────────────────────────────────────────────
const useTypewriter = (text: string, speed = 60, startDelay = 800) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      const tick = () => {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i));
          i++;
          if (i > text.length) setDone(true);
          else timeout = setTimeout(tick, speed);
        }
      };
      tick();
    }, startDelay);
    return () => { clearTimeout(start); clearTimeout(timeout); };
  }, [text, speed, startDelay]);

  return { displayed, done };
};




// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 32 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};


// ─── Main Component ────────────────────────────────────────────────────────────
const Index = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);

  // Headline typewriter - starts after intro fades (2.6s) + small gap
  const line1 = useTypewriter("LAUREL", 80, 3200);
  const line2 = useTypewriter("CROWNS", 80, 3800);
  const line3 = useTypewriter("ABOVE", 80, 4400);

  // Parallax on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const dx = (clientX / innerWidth - 0.5) * 2;
    const dy = (clientY / innerHeight - 0.5) * 2;
    mousePos.current = { x: dx, y: dy };

    if (bgRef.current) {
      bgRef.current.style.transform = `translate(${dx * -5}px, ${dy * -5}px) scale(1.04)`;
    }
    if (midRef.current) {
      midRef.current.style.transform = `translate(${dx * -2.5}px, ${dy * -2.5}px)`;
    }
  }, []);

  return (
    <>



      <div
        className="relative overflow-hidden"
        onMouseMove={handleMouseMove}
        style={isTouch ? undefined : { cursor: "none" }}
      >
        {/* ── Hero Background (parallax layers) ──────────────────────── */}
        <div className="relative w-full z-0 bg-background min-h-screen">
          {/* Layer 1 - image (most movement) */}
          <div
            ref={bgRef}
            className="absolute inset-0 z-0 transition-transform duration-75 ease-out"
          >
            <img
              src={heroBg}
              alt="The Republic"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Layer 2 - mid gradient (medium movement) */}
          <div
            ref={midRef}
            className="absolute inset-0 z-[1] pointer-events-none transition-transform duration-100 ease-out"
            style={{ background: "radial-gradient(ellipse at 40% 60%, hsl(38 72% 50% / 0.08) 0%, transparent 60%)" }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 z-[1] bg-black/40 pointer-events-none" />
          {/* Bottom blend */}
          <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-transparent via-transparent via-70% to-background" />
          {/* Vignette */}
          <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />

          {/* Particles */}
          <ParticleCanvas />

          {/* ── Hero Content ────────────────────────────────────────────── */}
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-end pb-10 pt-24 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-xs tracking-[0.5em] text-primary/70 uppercase font-body mb-4">
                An Interactive World Experience
              </p>

              {/* Typewriter headline */}
              <h1 className="font-display text-[2rem] sm:text-7xl lg:text-8xl tracking-[0.08em] text-foreground leading-tight w-full max-w-full overflow-hidden">
                <span className="block pb-1" style={{ WebkitTextStroke: "1.5px hsl(0 0% 95%)", color: "hsl(38 72% 50%)" }}>
                  {line1.displayed}
                  {!line1.done && <span className="typewriter-cursor">|</span>}
                </span>
                <span className="block min-h-[1em] pb-1" style={{ WebkitTextStroke: "1.5px hsl(38 72% 50%)", color: "hsl(25 35% 35%)" }}>
                  {line1.done && line2.displayed}
                  {line1.done && !line2.done && <span className="typewriter-cursor">|</span>}
                </span>
                <span className="block min-h-[1em] pb-1" style={{ WebkitTextStroke: "1.5px hsl(38 72% 50%)", color: "hsl(0 0% 95%)" }}>
                  {line2.done && line3.displayed}
                  {line2.done && !line3.done && <span className="typewriter-cursor">|</span>}
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: line3.done ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <p className="mt-8 font-narrative text-[1.0625rem] sm:text-xl text-foreground/70 italic max-w-lg mx-auto leading-[1.8] px-5 sm:px-0">
                "The Republic has no secrets. The records are complete. The ceremonies are sacred. You were not supposed to find this."
              </p>
            </motion.div>

            {/* CTA buttons + QuestTrigger */}
            <div className="mt-12 flex flex-col items-center gap-4 w-full px-6 sm:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: line3.done ? 1 : 0, y: line3.done ? 0 : 20 }}
                transition={{ duration: 0.8 }}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <Link
                    to="/world"
                    className="btn-pulse-glow w-full sm:w-auto text-center min-h-[52px] flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] uppercase transition-shadow"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    Enter the Republic
                  </Link>
                  <Link
                    to="/characters"
                    className="w-full sm:w-auto text-center min-h-[52px] flex items-center justify-center px-8 py-3 border border-primary/40 text-foreground font-display text-sm tracking-[0.2em] uppercase hover:border-primary/80 transition-colors"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    Meet the Players
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: line3.done ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full flex justify-center"
              >
                <QuestTrigger />
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: line3.done ? 1 : 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-8"
            >
              <div className="flex flex-col items-center gap-2 steam-rise">
                <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-body">
                  Scroll to Explore
                </span>
                <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Below-fold sections (scroll reveal) ─────────────────────── */}
        <div className="relative z-10 bg-background">
          {/* World teaser */}
          <section className="py-16 sm:py-24 px-5 sm:px-4">
            <div className="max-w-4xl mx-auto text-center relative">
              <ScrollReveal>
                <div className="steampunk-divider max-w-xs mx-auto mb-8" />
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h2 className="font-display text-2xl sm:text-3xl tracking-[0.1em] text-foreground">
                  A WORLD ON THE EDGE
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-6 font-narrative text-[1.0625rem] sm:text-lg text-muted-foreground leading-[1.8] max-w-2xl mx-auto w-full">
                  Panterra was built on the Cornerstone Laws, the bones of the conquered, and the dreams of the powerful. For nearly three centuries, the Republic has maintained order through the Dual Reign - Parliament, Sanctorium, and the Magistries between them. But there are signs of fracture within the order - growing more difficult to ignore by the day. The governed districts rumble with unrest, and yet the powerful still play their lethal games. All round the Known World, whispers of defiance are simmering into an uproar.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="steampunk-divider max-w-xs mx-auto mt-8" />
              </ScrollReveal>
            </div>
          </section>

          {/* Chronicles Scroll Collection */}
          <section className="py-16 sm:py-20 px-5 sm:px-8 border-t border-border/30">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-10">
                  <p className="font-display text-[9px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
                    ✦ The Chronicles of Panterra ✦
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl tracking-[0.15em] text-foreground">
                    Fragments of Forbidden Truth
                  </h2>
                  <div className="steampunk-divider max-w-xs mx-auto mt-4" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <ScrollCollection />
              </ScrollReveal>
            </div>
          </section>

          {/* Sample Chapters */}
          <section className="py-16 sm:py-20 px-5 sm:px-8 border-t border-border/30">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-10">
                  <p className="font-display text-[9px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
                    ✦ Sample Chapters ✦
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl tracking-[0.15em] text-foreground">
                    Read the First Six Chapters
                  </h2>
                  <div className="steampunk-divider max-w-xs mx-auto mt-4" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <SampleChapters />
              </ScrollReveal>
            </div>
          </section>

          {/* Navigation Cards */}
          <section className="py-16 px-4 bg-secondary/30">
            <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {[
                { to: "/world", title: "World Overview", desc: "Explore the Republic's territories, culture, and power structures" },
                { to: "/characters", title: "Character Database", desc: "Discover the key figures shaping the fate of the world" },
                { to: "/timeline", title: "Timeline", desc: "Trace the events that brought the Republic to the brink" },
                { to: "/map", title: "World Map", desc: "Navigate the regions of the Republic" },
              ].map((card, i) => (
                <ScrollReveal key={card.to} delay={i * 0.08} className="h-full">
                  <Link
                    to={card.to}
                    className="block h-full p-4 sm:p-6 bg-card border border-border hover:border-primary/40 transition-all hover:shadow-brass group"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    <h3 className="font-display text-sm tracking-[0.15em] text-primary group-hover:text-brass-glow transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-body">
                      {card.desc}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
          <Footer />
        </div>
      </div>

      <EasterEggGlyph />
      <ResetProgressButton />

      {/* BottomNav is rendered globally in Layout.tsx */}
    </>
  );
};

// ── Sample Chapters Reader ────────────────────────────────────────────────────
const CHAPTERS = [
  { number: 1, title: "Chapter I: The Wedding", content: `A Few Years Prior

Even though he had taken care not to wear shoes, Cole felt his rapid steps could still be heard, each time his bare feet touched down on the cool limestone lining the hallway of the old castle. Not just any castle. The Pantheon. Though perhaps it was only the sound of his heart, which pounded rebelliously even after years of training. He could not count on the damn organ to behave. Its loyalty was temperamental at best. Never mind that — he had only a few minutes before the checkout procedure, and he needed to be at her door right now. To see her before tomorrow. Her… his beautiful, too-good-for-him bride. His best friend, his person. His Aeternis. How had he gotten so lucky, to have found her again in this lifetime? They would not leave it to chance again. It was time to make their connection last for all eternity, across every life that followed.

The elaborate ceremony tomorrow would form a permanent bond between them. Between their souls, to be exact, for bodies were merely temporary, material, insignificant things. After tomorrow, neither of them would ever be alone again, not even for a passing moment.

Cole nearly broke into a run toward the castle quarter where they had split, where he had last seen her face before the Devotees led her away. He turned down stony corridors, too many to count, amazed that he was finding his way without trouble, as if the link between them had already been formed. As if the thread tugged at his chest with the other end tied to hers, and would lead him to her no matter the distance. He stopped in front of a large metal door and knocked three times, paused, then twice more. Exactly as they had agreed. The door slowly opened, and through the narrow gap, he saw her.

"You are not supposed to see the bride until the ceremony," Alyvia whispered as she opened the door wide, "the scripture says it's bad luck." The corners of her eyes crinkled with her smile.

"Nothing could give us bad luck ever again." He whispered back, arms already reaching out for her.

She looked down, letting his fingers trace the curve of her face. His touch was warm against her cold cheeks.

"I just," she stopped, "I just feel so lucky." She looked up and met his dark brown eyes with her own, glassy and blue. "I can't believe this is really happening." A thin stream of tears slid from the corner of her eye to his fingers.

He tilted her chin up and kissed her mouth, then her forehead. "Me too, my love." He pulled her into him and held on. "Me too."

Alyvia pressed her face into his shoulder, arms tight around his back. "I can't wait to tell my friends about everything. They'll be beside themselves when it's their turn."

"Yeah? Which part are you most excited about?" He loved the way her voice changed when she got like this: lighter, faster, alive with it. He rested his chin on her forehead and swayed gently, the way they used to at school dances at Colegio de la Cruz, where they had spent eight years growing up and falling in love.

"Oh, so many things… the silk dresses, the real flowers, all the other couples in love… and meeting His Sovereigncy in person. Having him conduct our wedding and Apotheosis." She exhaled softly. "I still can't believe it's tomorrow. Ellery and Clara made me promise to tell them everything about the Night of Reflection. They're desperate to know what actually happens in there."

"I'd like to know what you'll be up to tonight myself." He raised an eyebrow.

"I'm not telling you." She laughed quietly. "And I'm not asking about yours either. That's sacred. Between you and your…" she dropped her voice to a whisper, "sex."

He laughed. "Alright, alright. Come here." He held her tighter. "Don't forget your cloak at checkout. It's chilly tonight. I don't want you catching a cold on our wedding day."

She nodded, face buried in his chest.

"I should go back." He kissed her forehead. "It's going to be everything tomorrow. I'll see you on the other side."

"Don't take too long to find me."

"I'll be the first man through that door." A promise.

She smiled at that. Alyvia watched Cole move down the corridor, glancing back at her every few steps, and felt certain — the way you only feel certain about one or two things in a life — that they would always find their way back to each other. She pulled the heavy metal door shut behind her.

⁂

Cole made it back to his room minutes before the knock came. He opened the door to two Pantheon Devotees in dark green robes. They drew back their hoods and bowed. Cole was not prepared for how beautiful they were. They were older than him, perhaps by ten or fifteen years, and he was not used to seeing older women. Whatever time had taken from them, it had left plenty behind.

"Cole Avinas IX." The first woman's voice was soft but carried. Low, yet precise. He straightened at once and dismissed what he had been thinking a moment ago, ashamed to have had the thought the night before his wedding, and more ashamed by the suspicion that this woman had clocked it. Though they probably got that look often.

"I am Loda Alsephina II. This is Torrin Messar VI." The woman gestured at her fellow Devotee, who spared Cole a gentle smile. "We are here to guide you to the next stage of your Apotheosis. Are you ready to begin your Night of Reflection?"

"Yes, of course." He reached for his duffle bag.

"You will not need anything you brought," the second Devotee said. "Everything you will need will be provided inside your Reflection Chamber."

"Oh, okay." Cole set his bag down by the door, and felt childish for packing an overnight bag.

"If you are ready, please follow us." The Devotees stepped back, giving room to Cole to step out.

"Yes, of course." Cole stepped into the hallway and stopped short. There were about ten other men lined along the corridor. He felt immediately foolish — of course the Devotees would not collect each groom individually. There were hundreds of couples participating in the ceremony tomorrow. He fell in at the back of the line, and the group moved. They stopped at another door along the way. The two Devotees knocked, and then another man stepped out and joined the line. They started walking again. Cole glanced back at the newest addition. No one else had acknowledged him.

"Hey," he said, "I'm Cole Avinas."

"Nodden Visse." The man smiled, uncertain. "I had no idea I'd be seeing other people tonight."

"I had the same thought." Cole felt the tension leave his shoulders.

"Do you know how many more of us they're gathering before we go to… wherever they're taking us?"

"I haven't a clue. But I hope we get there soon."

"Yeah well I didn't sign up for a forced march." The man directly in front of Cole turned around, facing him and Nodden. "For what we paid to be here, I expected more comfort and less of this weird shit." He glanced back at the robed figures ahead. "Since I came yesterday, it's been nothing but Devotees gliding around like they're haunting the place. Oh I'm Jack, by the way."

Cole smiled. They had paid a great deal to be here — more than made sense, really. The money could have gone toward a better living unit. But the wedding had been Alyvia's dream since she was small: not just a wedding… an Apotheosis ceremony. Eternal binding of souls, not just "till death do us part." Conducted by His Sovereigncy the Sol Deus Lockland himself — and held at Pantheon Ivory, the oldest of the twelve, the first, the original.

He decided this was funds well spent. After all, he could always make more money. His level II Technologist promotion was coming. And once it did, he'd save fast and upgrade their unit, even if Alyvia had not secured a placement yet and was still classified as Non-Preferential. That word. That absurd euphemism — it did not mean she had no preferences, it meant none of the Magistries had preferred her enough to take her. Well, her time will come. Cole had faith that she would get there.

The group slowed to a stop. Loda Alsephina spoke.

"Gentlemen, we have arrived. The chambers are housed in the hallway behind us. Walk down the corridor, find the door marked with your own Semper, and go inside. Each room has been prepared for you individually. Enjoy your Night of Reflection." She paused and took a moment to look at each of them. "We will see you on the other side."

Both women bowed.

"Good luck, Nodden. You too, Jack." Cole said. "Good to meet you both."

"You betcha." Nodden gave a thumbs up and a wide, slightly goofy grin.

Jack just lifted a hand and walked on, scanning the doors.

⁂

Cole found his door at the end of the corridor — marked "CAIX0504". No handle. He pushed gently and it slid open. He stepped inside and was met with the warm glow of floor lamps and a scent that stopped him in his tracks. He turned back to the hallway. It was already empty and dark, every other man had disappeared into his own chamber, and the Devotee women were gone. Strange. He stepped fully inside.

The door sealed behind him. The light seemed to brighten as it did. The Reflection Chamber — as it was known outside these walls — was not what the name suggested. It was quite large and unhurriedly grand: leather sofas, wooden tables, a tall ceiling with old-fashioned crown molding, floors that looked like hardwood but could not be, for real preserved wood would have cost a fortune per room alone. No windows, but the walls were papered in illustrations of trees and flowering things. It reminded him of Premiere Jude's office, or at least the part of it visible during broadcast speeches.

Cole breathed in the scent slowly, sorting through memory for a match. So curiously nostalgic yet he found nothing — so familiar it almost hurt. It was not pulling up any mental images. It simply made him feel safe, settled, like being held. Like the feeling he experienced meeting Alyvia, when his life's unexpected turns seemed to have delivered him somewhere exact, not a moment too early or too late.

A music note reached him from the adjacent room. Slow, soft, and melodic. A pianoforte, or a recording of one. There would not be a live performance, he thought — that would be wasteful, not efficient at all.

He moved toward the leather chair and the side table beside it. Crystal bottles caught the lamp light, filled with amber liquids ranging from pale gold to dark syrup. He uncorked one and lifted it to his nose. So rich the scent, so decadent. He poured two fingers into the tumbler and sipped. It burned going down and then smoothed everything out behind it.

The large bookshelf was the most interesting thing in the room: built into the wall, floor to ceiling, crowded with titles. He recognized the classics instantly. Then he noticed the others: the banned ones, the books that the authorities had quietly removed from public libraries. Ah, so this is the temptation.

He pulled one from the shelf: The Book of Warslaw: A Collection of Poems of the King's Journey Down into the Underworld.

The book was clearly well-loved: tattered pages, cracked spine that still somehow held. He carried it back to the chair, shrugged off his jacket, and settled in — ankle crossed over one knee, tumbler in hand, book open on his lap. The alcohol eased something in his chest. The music moved through the room like water. He began to read the first poem:


As They Ponder

Each midnight hour demons knock on my door,
And whisper that my faith was built on sand.
My heart has ceased to argue as before,
Yet still my fingers reach for her cold hand.

They say a King must never mourn the dead,
That silence is the portion of the gone.
I burned their letters, burned what counsel said,
And kept but one thing: Her, to dwell upon.

What use is crown that could not hold one life?
So let them come, my demons, at their hour,
And tell me faith…


Cole took another drink and felt his eyelids grow heavy. This is some dark poetry — maybe not the best material to read the night before a wedding. He had so much to look forward to tomorrow. Both of them did. He took another sip, fingers gently tapping the leather armrest to the slow beats of the piano. His eyes grew heavier. Maybe a nap first, he thought, as he looked down at the page. One more sip. And he closed his eyes, still smiling.

⁂

In the early hours of the following day, before sunrise, two men dressed in standard maroon Magistry of Cure uniform entered Cole's Reflection Chamber to retrieve him. His body was already cold — no longer the reliable warmth that Alyvia had pressed herself against on so many nights before.

Cole had been healthy and athletic in life. His body had a high recycling value. The men undressed him, misted his nakedness with preservation tonic and wrapped him in cellophane before sealing him inside a cold temperature-controlled body bag with his Semper printed on the tag. They carried him out and slotted him carefully into the refrigerated truck bed, on top of another body bag tagged NVIII0729.

On the other side of the Pantheon, two identically dressed men came for Alyvia. They found her still holding the champagne flute, her grip rigid. She had been a slight and sickly thing while alive — no Arborwell patron would pay to reuse a body like hers. So they did not bother with the preservation mist. They simply opened the metal box in the back of the utility van and dropped her in. The box was already full however, her head and one arm hung over the side. One of the men grabbed her and turned her sideways, pressing down.

"Damn it, the fucking lid won't shut." He shoved at the other bodies, working to make room. Then he folded her arm inward firmly, without ceremony, unconcerned with the unnatural angle, until it fit.

"Bingo." He pressed the lid down and drove in the nails. "This one's done!" He called to the driver, who raised a hand in acknowledgement as the van pulled away toward the mass burial ground at the center of the Deep Forge.` },
{ number: 2, title: "Chapter II: Remsays", content: `"Good morning, Remsays."

Zeus said it at six-fifteen, the same time every morning, in the same measured tone. Not cheerful nor clinical. Simply present. Remsays had programmed him that way precisely. He did not want to be managed, just informed of the facts.

Remsays opened his eyes to the pale morning light coming through the window shade and lay still for a moment before getting up, taking stock of how his body felt. Shoulders: fine. Lower back: a little tight from the training session two days prior. He flexed both hands once and sat up.

"How did I sleep?"

"Six hours and eleven minutes. Two complete deep cycles. Cortisol on waking is within normal range. You were restless between the fourth and the fifth hour."

"It was the dream."

A pause. Longer than Zeus's pauses usually were. "The same one."

"Yes."

"Would you like me to save it?"

He thought for half a second. "Yes. Flag it and I'll decide later."

"Remsays." Zeus did not typically volunteer observations outside of the briefing sequence. "This is the fourth occurrence in nine days."

"I know."

"The pattern suggests it may be worth addressing."

"Noted. I'll think about it."

He rose and moved to the wall mirror.

One hundred and eighty-four centimeters. Lean muscle, the result of a consistent regimen rather than any particular trendy program. His hair was sandy and had grown a full week past where he liked it, which meant he would take the clipper to it this morning before he left for the Forum.

His eyes, in the mirror, were what they always were: light grey, the color of overcast sky. He had been told, many times and by many different people, that they were unsettling. He had been told other things too. He received compliments the way he received most things: with a polite acknowledgment and no particular change in behavior.

There had been a time, not long ago, when he might have let it all go to his head. He was still young by any measure: twenty-seven, his second revolution not long behind him, and the attention from men and women had started well before he entered the Magistry. The girls at Cambria academy used to find reasons to walk past his study room. The senior officers in his first years at Parliament had found reasons to knock on his door. He was not naive about why. But he had also watched what happened to men who let that kind of attention become their primary navigation. They drifted. They made choices based on the wrong kind of wanting. Remsays had other plans, and they required him to stay sharp.

He turned his chin slightly to examine the cut in better light and touched it gently with two fingers. A clean line, roughly four centimeters, running from just below his cheekbone toward the jaw. Still healing. Another few weeks and it would be gone entirely, the tissue smooth again. He had decided he would not mind if it did leave something behind, but it would not.

The incident had happened during a routine field assessment in the Northwest Quadrant, six months into his tenure as Chief Magister. He had accompanied a team of Paragon researchers into an underwater survey corridor flagged as structurally questionable, against the explicit recommendation of the head Ocean engineer. The engineer had been correct. As the group resurfaced one after another, a panel gave way under pressure and a female researcher was trapped behind it. In her panic she accidentally hooked the oxygen line on the jagged edge of the panel frame. Remsays turned back and pressed himself through the gap before the second panel could close. The serrated metal caught his helmet and opened the cut. She made it through because of the extra seconds that bought her.

The survey data they obtained that day had informed two subsequent patents in marine remediation. Worth it, he had written in his incident report, and meant it. The next day, the researcher had come to his office to thank him in person and stayed longer than the purpose required. He had thanked her in return, then to her surprise, reassigned her to the far regions effective the following week. Her panicking in that corridor was an error he had no interest in reencountering.

He had laid out the clothes the night before: a crisp white button-up, navy trousers. Mornings that required decisions about small things were mornings that wasted energy on small things. While he dressed, Zeus recited the morning brief. Two items from the Magistry of Ocean that would need his sign-off before the Forum session. A scheduling update from Premiere Jude's office confirming the lunch function. And a note from the Sanctorium that Remsays asked Zeus to repeat: the ascension of Sol Deus Lockland of Pantheon Ivory had been formally scheduled in the current lunar cycle. In just three days.

Three days. This was unexpected.

The Sanctorium made decisions that governed their own body on their own timeline and with no obligation to preview them, but the general sense in the Parliament had been that the ascension was still a season away. Three days changed a great many things. It meant thirty days of vacancy in Pantheon Ivory starting later this week, thirty days with no Sol Deus, before the installation of a new one at the solar turn. He could picture the status-climbers already working their brains to see how they might best profit from a quick transition.

He pulled up his calendar and looked at the red circle he had drawn there two weeks ago when the private correspondence had arrived. It was handwritten in small, precise handwriting. The postscript was two words:

Almost time.

He had read that letter standing at his desk and felt something shift in his chest. He had folded it and put it in the locked drawer and gone back to work.

He would refocus on work now too. What he should be thinking about was the speech.

The Paragon Command held a new recruit induction ceremony every season, and he had given this address exactly once before. Three months ago, in the late season, a smaller cohort, and he had spent two weeks preparing for it and then delivered it in a room that felt too large and came away with the uncomfortable sense that he had not made quite the impression he had hoped.

Today's induction mattered more. Not only because the cohort was larger, though it was, or because it was the primary induction of the new cycle, though it was that too. It mattered more because he had spent the last three months thinking about what he had gotten wrong the first time. He was not nervous, particularly, but he understood that the first impression a person made in a room was the one they carried for a long time afterward, and the new Paragons he was about to address would be the next generation of the Magistry's best minds. He wanted the words to be right.

Zeus navigated the car through the early morning streets while he continued to recite the news. An advancement in ocean remediation technology out of the Northwest Quadrant. A procedural update from the Magistry of Peace. Something about atmospheric pressure readings from Pantheon Greenwood that the Magistry of Stars had flagged for cross-reference. Remsays filed it all away without quite listening. The car stopped at the Parliament entrance. Remsays straightened his jacket, checked the time, and stepped out.

⁂

Cannon Place in the morning had its own particular quality. The glass panels of the main entrance caught the early light and threw it across the lobby floor in long strips, and the junior servitors who staffed the front desks always straightened slightly when the doors opened for someone with rank.

The morning unraveled before he reached his office.

Remsays was halfway through the east wing when his watch signaled an urgent flag from the Archive. He took the stairs instead of the elevator and arrived to find Servitor Anwen Visse standing in the doorway of the records anteroom with the expression of someone who had been awake for too long and was bracing for a difficult conversation.

Anwen was not a young man. He had been in the Archive for almost as long as most of the current Paragon class had been alive, and he wore it without complaint, the particular steadiness of someone who had decided early that their work was worth doing carefully for its own sake. He also wore his age without the constant use of booster vials that most servitors of his generation depended on, which Remsays had noticed the first week and had not forgotten. The vials were expensive and the Republic's dispensaries made them easy to obtain, which was a combination that had a predictable effect on people with long service and flagging energy. Anwen appeared to have no interest in them. His stipend went where stipends were supposed to go. Remsays trusted him for that, among other things.

"Tell me," Remsays said.

"The environmental impact records from the Northwest Quadrant coastal survey. Cycles twenty-two through twenty-six. They are not in the primary archive, nor in the secondary backup, and the filing index lists them as transferred to deep storage eighteen months ago. But deep storage has no record of receiving them."

"Who authorized the transfer?"

"That is the other problem, Chief Magister." Anwen looked pained to continue. He swallowed. "The transfer authorization carries the Semper from a servitor who left the Magistry fourteen months ago. He went to Apotheosis in the winter cycle. So we cannot ask him."

Remsays stood quietly for a moment. He was not irritated, exactly, though he had every right to be. These coastal records were fundamental to the remediation modeling that underpinned at least three active Paragon projects. If they were truly gone, those projects would have to revalidate five cycles of assumptions from scratch. Months of work. More importantly, months of time.

"Pull every transfer log from the eighteen-month window. Not just the flagged ones. Everything that touched the archive during that period. And get me the physical access logs for deep storage. Someone signed in."

"Yes, Chief Magister."

Remsays checked his watch. Three hours until he was due at the Premiere's Quarters. "You have two hours."

He worked through the access logs himself while Anwen and the archivist team ran the transfer trail. It was painstaking and largely tedious and he did it because the alternative was handing it off and waiting, and waiting was its own kind of waste. As he worked, another feeling began to move in the back of his head, quieter and more unsettling than the irritation.

What if this were not an error?

He turned it over. A system malfunction was unlikely. The Archive was meticulously logged and managed, and nothing like this had happened before, not in the six months he had been running the department and not in the years of records that preceded him. What was in those cycles of data that could have tempted someone, someone with high clearance, to remove them? And whoever had done it appeared to have used the identity of a man who had gone to Apotheosis over a year ago. The transfer code was his. But the man was gone.

Could someone have imprinted a false Semper? Used a dead servitor's code to move through the system undetected?

He let himself follow the thought for a moment longer than was comfortable, then pulled back from it. The Semper was engraved subdermally. A unique biometric code. It could not be altered or replicated, not by any process available to a civilian. He was letting the strangeness of the situation push him into conclusions the evidence did not support. The simplest answer was still a filing error. He set the thought down and kept working.

It stayed at the edge of his attention anyway, which bothered him more than he wanted to admit.

What emerged, after an hour and forty minutes of cross-referencing, was not the theft he had half-braced for. The records had been misfiled under an obsolete quadrant classification system that predated the current administration. They were in the archive the entire time, three index entries away from where they should have been, invisible to any automated search because the field codes did not match.

Anwen found them first and said nothing for a moment, then looked up at Remsays with the expression of someone who was not sure whether to be relieved or ashamed.

"Fix the index," Remsays said. "And update the standard for how quadrant codes are verified on transfer. I do not want this happening again."

"Yes, Chief Magister. I am sorry for the interruption to your morning."

"You flagged it immediately. That is what I want." He stood and straightened his jacket. "Send the remediated file reference to the three affected Paragon leads before midday."

Remsays went to his office. He only had a short time before the lunch function. He would use the time to review the induction speech one final time. The sabotage idea was still moving somewhere at the back of his head, making him uneasy in a way he could not fully justify and could not entirely dismiss. He stood at the window with the holograph text projected at eye level and ran the words quietly in his head, watching the plaza below fill up with the morning's foot traffic, and thought about how quickly things could change.

Almost time.` },
  { number: 3, title: "Chapter III: Carmela", content: `The Forum lunch was held in the Premiere's private dining room on the second floor of Premiere's Quarters, where the floor to ceiling windows looked out over Plaza de Montecito and the afternoon light came in clear and clean. Nine people around a long table: the four Magistry directors, one senior Parliament advisor, two officials from the Sanctorium liaison office, with Premiere Jude at the head, Remsays to his right.

Remsays had been seated there for six months now, and he still noticed the small adjustments people made the second Jude walked in the room. People tracked Jude without trying to, oriented toward him the way a group of people in a cold room would orient toward the only source of heat. He had understood from early in his career that access to the Premiere was the currency that made everything else in the Forum function.

What Remsays had not fully anticipated was how much he would find himself studying the Premiere, trying to understand the specific quality that made a room of capable and ambitious people follow Jude with something that looked more like relief than mere deference. Remsays had spent considerable time thinking about how Jude produced this effect, because it was not simply rank or decades of tenure. It was how Jude did everything with attention, the way he gave it to whomever was speaking, without the fractional distribution that most powerful people couldn't quite suppress. When Jude was listening to you, you had the impression that your particular problem was the only problem on the continent.

Chief Peace Director Aspen Landsrae was already seated when Remsays arrived. He was around Remsays's age, perhaps a year or two older, with dark olive skin, black hair cropped close to his head, and the kind of easy, assembled handsomeness that made people want to look at him. He was broadly built, the shoulders and arms of someone who maintained his body seriously. Though Remsays had suspected, over months of working adjacent to him, that Aspen's build was likely unnaturally obtained. But to each of their own. The augment market was not illegal, only frowned upon.

Aspen looked up when Remsays took his seat and offered him the smile that he gave to everyone. "Chief Magister. Good afternoon."

"Director." Remsays set down his notes, he did not wish to engage in small talk.

The Sanctorium had sent two representatives: Lunary Kasen Welliver of Pantheon Greenwood, whose participation in these functions was routine, and Lunary Gemma Avinas of Pantheon Prisma, whose presence required a brief explanation for anyone unfamiliar. Gemma was Lunary to Sol Deus Thema, the most senior Sol Deus after Lockland, and the figure the Sanctorium was relying on most heavily to manage the Ivory transition.

She was a small woman, pretty in a precise and self-possessed way, with shoulder-length blonde hair tucked neatly behind her ear and the kind of composed expression that made it genuinely difficult to tell what she was thinking at any given moment. She wore the formal Lunary robe with the silver laurel leaves pinned to her chest. Remsays had encountered her at two prior functions and had each time come away with the sense that she was paying more attention to the room than her stillness suggested. Therefore Remsays did not trust her, but he did not trust anyone currently on the Sanctorium side.

The Lockland announcement opened the formal business. Aspen dove into it immediately, with the practiced ease of someone who had been preparing his position since the news broke. He questioned with emphasis whether the thirty-day vacancy in Ivory's governance created any regulatory exposure in the eastern territories, and then, before the Sanctorium liaisons could respond, noted that the convoy's three most recent disruptions had all occurred within the eastern corridor. He did not frame it as an accusation, but it was a fact of the Pantheon's weakness that was difficult to deflect. And offered to lend his Northeast Quadrant peace officers to reinforce the shipping routes as well as the Pantheon itself.

"The Sanctorium has full transition protocols for a period such as this," Gemma said. Her voice was measured and unhurried, the voice of someone who had given this answer before and expected to give it again. "Ivory's own sentries are trained for exactly the kind of security that a sacred transition requires. The introduction of Magistry personnel into Ivory grounds during a sacred transition period would be seen by the faithful as an intrusion. I do not think any of us want the devotees feeling as though their grief is being policed."

"With respect, Lunary," Aspen said pleasantly, "I am not talking about policing grief, I am talking about a thirty-day window in which Ivory has no sitting Sol Deus, which is the longest unprotected window the Sanctorium has had in over two decades. The convoy has shown a clear interest in symbolic targets."

A few people showed surprise at the mention of the convoy, a rumored rebellion group that the mass has attributed the unsolved crimes to.

"The convoy," Gemma said, tone inquisitive rather than mocking, "Director Landsrae, am I to believe my ears that you are suggesting the convoy is the culprit behind these so-called interruptions in Ivory's eastern regions? That is pure conspiracy, a lore in the Deep Forge that school masters tell the young children."

Aspen spread his hands in a gesture that might precisely be the case. "We cannot afford to ignore any potential piece of intelligence, not at the Magistry of Peace. We have to assume their existence until we have evidence to the contrary, because the cost the other way around is simply unaffordable."

"Regardless, Pantheon Ivory is not unprotected," Gemma sighed, not wanting to debate a rumor so she shifted strategies. Her tone carried the faintest edge now. "Sol Deus Thema will personally oversee continuity of Ivory's operations for the duration of the vacancy. Their sentries will answer to her. I would remind this table that the Sanctorium's jurisdiction over its own grounds is not conditional."

Director Atara Bode of the Northwest Magistry of Ocean set her glass down. "Sol Deus Lockland has been presiding for longer than some of the devotees have been alive. He was beloved by virtually all, not just within the Sanctorium but out here in the Deep Forge and in the Parliament as well. Our people are frightened. The convoy, whether the rumors are to be believed or not, are still smart and sophisticated criminals. They are organized and have shown they can exploit this kind of emotional state. Director Landsrae's concern is worth taking seriously rather than routing it through protocol."

"I am not routing it through protocol," Gemma said. "I am routing it through the law."

Director Matos Wittaker of the Southeast Magistry of Stars made a sound in his throat that was not quite agreement and not quite objection.

Aspen turned to him slightly and said amiably, "I think what Director Wittaker is suggesting is that the law and the current threat landscape may not be perfectly calibrated to one another."

"Director Landsrae is an excellent interpreter of my silences." Matos said drily.

A few people at the table suppressed a snicker.

Premiere Jude had let the conversation run, which was how he always operated: giving the table enough time to reveal what it actually thought before he shaped it. He cleared his throat. "The Sanctorium's jurisdiction over Ivory's grounds is not a question before this table." He said it without looking at Aspen. "What is before this table is whether the Parliament has an obligation to offer additional support to the surrounding eastern territories during the transition period, which is a different conversation entirely and one I am happy to have. I will call on Sol Deus Thema as well as Lunary Carmela of Ivory directly to understand what, if anything, would be welcome from the Parliament's side. What matters to me is that the citizens feel steady during the changeover. Our role is to be present and visible and to continue our work without too much commentary on the succession itself. It isn't our place to do so."

There was a visible easing of tension in Lunaries Gemma and Kasen. Gemma said nothing, but she unfolded her hands.

"Regarding the convoy rebellion," Jude continued, glancing briefly at the table as a whole, "is a matter I want elevated to a separate briefing. Aspen, I want a full incident summary on my desk before the end of the week."

"Yes sir." Aspen's tone agreeable as always.

Jude's eyes moved to Remsays. "The Paragon induction this afternoon."

Remsays looked up from his notes.

Jude continued, "What is your read?"

"A good day for it," Remsays said. "The recruits chose to be here and were chosen to be here. On a day when everyone is thinking about what comes after, I would rather they leave the Forum feeling purposeful."

Jude nodded once, and looked at Remsays for a moment with an expression that was not quite paternal but on the same spectrum, something that said he was pleased and not surprised to be pleased.

The rest of the lunch moved through its business without incident. Director Tekin Alimetry of Northwest Magistry of Cure raised the quarterly booster vial allocation figures, which produced a brief technical discussion Remsays participated in precisely as much as was necessary. Atara and Aspen argued mildly about an observatory budget line — equipment vs. surveillance. Remsays offered a proposed reallocation that resolved the dispute without requiring either of them to concede, and the table moved on.

Walking out after, Aspen fell into step beside him before Remsays had reached the stairwell.

"Well done in there, Remy." He said it easily, the warmth already assembled. "You're getting good at this."

Remsays thanked him. He had, in the early months of his tenure, entertained the idea that he and Aspen might become friends. They were close in age, in rank, and had both risen faster than most people around them thought was appropriate for their years. But Remsays had noticed quickly, with disappointment, that Aspen flattered everyone in his path and delivered the flattery with the same sincerity regardless of who was on the receiving end. It was not dishonesty exactly, but Remsays found it exhausting in practice.

"Do you mind if I come to the induction ceremony?" Aspen asked, in the light tone of someone who had already decided to come.

Remsays looked at him. "Are you already making moves on my people before they've finished their first day?"

Aspen smiled with his whole face. "Just want to see the new talent. I want to feel hopeful for the Republic's future."

There was no politically sound way to decline. Paragon recruits were permitted to transfer if their talents served another Magistry better. And Remsays felt he had nothing to hide from a man he simply did not entirely trust.

"Then you are welcome," Remsays said. "Tone your charm down a notch. I don't need the new recruits fanning over the almighty Aspen Landsrae just yet."

Aspen laughed throatily, which was the sound of someone who had been told a version of this before and found it more delightful than chastening. He clapped Remsays once on the shoulder with firmness.

Remsays continued up the stairs and put the conversation behind him. He had forty minutes before he needed to be in the induction hall. He would use them to go over the speech a final time.` },
  { number: 4, title: "Chapter IV: Paragon Command", content: `` },
  { number: 5, title: "Chapter V: Lockland", content: `` },
  { number: 6, title: "Chapter VI: Apotheosis", content: `` },
];

const SampleChapters = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chapter = CHAPTERS[currentIdx];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIdx]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="steampunk-divider max-w-xs mx-auto mb-6" />

      <div className="text-center mb-1">
        <h3 className="font-display text-xl tracking-[0.12em] text-primary">
          {chapter.title}
        </h3>
      </div>
      <p className="text-center font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Chapter {chapter.number} of {CHAPTERS.length}
      </p>
      <div className="steampunk-divider max-w-[120px] mx-auto mb-6" />

      <div
        ref={scrollRef}
        className="chapter-scroll-container"
        style={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
           <div className="font-narrative text-[0.9375rem] leading-[1.9] text-foreground/80">
  {(() => {
    const lines = chapter.content.split("\n");
    let inPoem = false;

    return lines.map((line, i) => {
      const trimmed = line.trim();

      // Section break
      if (trimmed === "⁂") {
        inPoem = false;
        return (
          <p key={i} className="text-center my-8 tracking-widest text-foreground/30">
            ⁂
          </p>
        );
      }

      // Time stamp line
      if (/years?\s+(prior|later|before|after)/i.test(trimmed)) {
        inPoem = false;
        return (
          <p key={i} className="text-center font-display text-[10px] tracking-[0.35em] uppercase text-muted-foreground mt-2 mb-8">
            {trimmed}
          </p>
        );
      }

      // Poem title — triggers poem mode
      if (trimmed === "As They Ponder") {
        inPoem = true;
        return (
          <p key={i} className="text-center font-display text-sm tracking-[0.2em] text-foreground/60 mt-8 mb-4">
            {trimmed}
          </p>
        );
      }

      // Empty line
      if (trimmed === "") {
        return <div key={i} className="h-4" />;
      }

      // Poem lines — all centered while inPoem is true
      if (inPoem) {
        return (
          <p key={i} className="text-center font-narrative italic text-foreground/70 leading-[2.2] w-full">
            {trimmed}
          </p>
        );
      }

      // Default prose
      return (
        <p key={i} className="text-left leading-[1.9] mb-0">
          {trimmed}
        </p>
      );
    });
  })()}
</div>

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => setCurrentIdx((i) => i - 1)}
          disabled={currentIdx === 0}
          className="font-body text-[10px] tracking-[0.25em] uppercase border border-border/40 px-5 py-2 min-h-[44px] hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          style={isTouch ? undefined : { cursor: "none" }}
        >
          ← Previous Chapter
        </button>

        <div className="flex gap-1.5">
          {CHAPTERS.map((_, i) => (
            <span
              key={i}
              className={`block w-1.5 h-1.5 rounded-full transition-colors ${i === currentIdx ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIdx((i) => i + 1)}
          disabled={currentIdx === CHAPTERS.length - 1}
          className="font-body text-[10px] tracking-[0.25em] uppercase border border-border/40 px-5 py-2 min-h-[44px] hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          style={isTouch ? undefined : { cursor: "none" }}
        >
          Next Chapter →
        </button>
      </div>
    </div>
  );
};

// ── Easter egg glyph - awards Scroll 6 + navigates to bestiary ────────────────
const EasterEggGlyph = () => {
  const navigate = useNavigate();
  const { foundScroll } = useGame();
  
  const handleClick = () => {
    foundScroll(6);
    navigate("/bestiary");
  };

  return (
    <button
      onClick={handleClick}
      aria-hidden="true"
      tabIndex={-1}
      className="fixed bottom-[70px] sm:bottom-3 left-3 z-[5] w-6 h-6 flex items-center justify-center select-none"
      style={{ opacity: 0.15, cursor: "default" }}
    >
      <span className="font-display text-base" style={{ color: "hsl(38 30% 40%)" }}>✦</span>
    </button>
  );
};

// ── Hidden reset button - clears all game progress ────────────────────────────
const ResetProgressButton = () => {
  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/");
  };

  return (
    <button
      onClick={handleReset}
      className="fixed bottom-[70px] sm:bottom-3 right-3 z-[130] font-display text-[9px] tracking-[0.15em] uppercase"
      style={{
        opacity: 0.5,
        border: "1px solid rgba(184, 150, 12, 0.6)",
        padding: "4px 12px",
        color: "hsl(38 60% 55%)",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Clear Progress
    </button>
  );
};

export default Index;
