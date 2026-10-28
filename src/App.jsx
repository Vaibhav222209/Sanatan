import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Bookmark, Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, ExternalLink, Heart, Menu, RotateCcw, Search, Sparkles, Sun, Trophy, X } from 'lucide-react';
import { scriptures } from './data/scriptures';
import { quizzes } from './data/quizzes';
import { dailyVerse, hindiNumber, normalize, readSaved, searchScriptures } from './lib';

const allVerseIds = scriptures.flatMap((book) => book.verses.map((verse) => verse.id));
const categories = [{ id: 'all', label: 'सभी ग्रंथ' }, { id: 'shiva', label: 'शिव पुराण' }, { id: 'gita', label: 'भगवद्गीता' }, { id: 'ramayana', label: 'रामायण' }, { id: 'bhagavata', label: 'भागवत पुराण' }, { id: 'devi', label: 'देवी भागवत' }];

function Lotus({ className = '', ...props }) {
  return <svg viewBox="0 0 80 48" fill="none" className={className} aria-hidden="true" {...props}><path d="M40 42C17 42 9 30 7 17c15 0 26 7 33 25Zm0 0C63 42 71 30 73 17 58 17 47 24 40 42Z" stroke="currentColor" strokeWidth="1.5"/><path d="M40 42C25 34 23 17 27 8c9 4 14 15 13 34Zm0 0C55 34 57 17 53 8c-9 4-14 15-13 34Z" stroke="currentColor" strokeWidth="1.5"/><path d="M40 42C29 29 31 11 40 2c9 9 11 27 0 40Z" stroke="currentColor" strokeWidth="1.5"/><path d="M18 46h44" stroke="currentColor" strokeLinecap="round"/></svg>;
}

function SacredSymbol({ type, className = '' }) {
  return <svg className={`sacred-symbol ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="50" cy="50" r="42" opacity=".14"/><circle cx="50" cy="50" r="34" strokeDasharray="1 5" opacity=".25"/>
    {type === 'shiva' ? <><path d="M50 77V23m0 0-6 12m6-12 6 12M31 29c-3 19 5 24 19 24s22-5 19-24m-38 0-5 9m5-9 6 7m32-7 5 9m-5-9-6 7"/><path d="m38 63 24 10V59L38 73V59l24 14"/></> : type === 'ramayana' ? <><path d="M34 23c33 9 37 43 0 54l13-27-13-27Zm13 27h31m-7-5 7 5-7 5M23 50h21"/><path d="m35 23 12 27-12 27" opacity=".5"/></> : type === 'devi' ? <><path d="M50 76C20 63 22 44 27 35c12 3 20 14 23 41Zm0 0c30-13 28-32 23-41-12 3-20 14-23 41Z"/><path d="M50 76C32 57 35 32 50 23c15 9 18 34 0 53Zm-25 2h50"/><path d="M50 33v29" opacity=".5"/></> : type === 'bhagavata' ? <><path d="M40 66c-17-12-14-32 5-39 17-6 30 8 24 23-5 13-22 11-22 2 0-6 8-8 12-4M40 66l-8 11h30l-7-12M34 77h29"/><path d="M46 64c7 2 18-2 22-11M38 41c-3 7-1 14 5 18"/></> : <><path d="M26 70 70 26l7 7-44 44-7-7Z"/><path d="m39 57 3 3m5-11 3 3m5-11 3 3M69 29c-13-9-11-23-1-16 8 5 5 11 1 16Z"/><path d="M64 31c-12-7-22-4-23 4 10 3 18 1 23-4ZM27 72l-4 5m7-2-1 6"/></>}
  </svg>;
}

function Dialog({ title, onClose, children, className = '' }) {
  const container = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const node = container.current;
    node.querySelector('button')?.focus();
    function keyboard(event) {
      if (event.key === 'Escape') close.current();
      if (event.key === 'Tab') {
        const targets = [...node.querySelectorAll('button:not(:disabled), a[href], input, [tabindex="0"]')].filter((item) => item.getClientRects().length);
        const first = targets[0], last = targets.at(-1);
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, []);
  return <div className="dialog-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} ref={container} className={`dialog ${className}`}><button className="icon-button dialog-close" onClick={onClose} aria-label="बंद करें"><X size={21}/></button>{children}</section></div>;
}

function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [reader, setReader] = useState(null);
  const [savedOpen, setSavedOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [toast, setToast] = useState('');
  const [saved, setSaved] = useState(() => { try { return readSaved(window.localStorage, allVerseIds); } catch { return []; } });
    const selectedDaily = dailyVerse(scriptures);
  const filtered = searchScriptures(scriptures, query, category);

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3500); return () => clearTimeout(id); }, [toast]);
  function toggleSaved(id) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem('anant-sanatan-saved', JSON.stringify(next)); }
    catch { setToast('इस ब्राउज़र में सहेजने की सुविधा उपलब्ध नहीं है।'); }
  }
  function navigate(id) { setActiveNav(id); setMenuOpen(false); }
  function openBook(book) {
    let index = 0;
    if (query.trim()) {
      const needle = normalize(query);
      const match = book.verses.findIndex((verse) => normalize(`${verse.sanskrit} ${verse.translation} ${verse.reference}`).includes(needle));
      if (match >= 0) index = match;
    }
    setReader({ book, index });
  }
  async function copyVerse(book, verse) {
    const text = `${verse.sanskrit}\n\n${verse.translation}\n— ${book.title} · ${verse.reference}\nअनन्त सनातन | निर्माता: वैभव ठाकुर`;
    try { await navigator.clipboard.writeText(text); setToast('श्लोक और हिंदी भावार्थ की प्रतिलिपि बन गई।'); }
    catch { setToast('प्रतिलिपि नहीं बन सकी। श्लोक को चुनकर कॉपी करें।'); }
  }
  return <>
    <a className="skip-link" href="#main">मुख्य सामग्री पर जाएँ</a>
    <div className="top-blessing"><span>॥ ॐ श्री गणेशाय नमः ॥</span><span className="top-right">ज्ञान से भक्ति तक, एक अनन्त यात्रा</span></div>
    <header className="site-header">
      <div className="container header-inner">
        <a href="#home" onClick={() => navigate('home')} className="brand" aria-label="अनन्त सनातन — मुख्य पृष्ठ"><span className="brand-symbol">ॐ</span><span><span className="brand-name">अनन्त सनातन</span><span className="brand-tagline">शाश्वत ज्ञान · सनातन संस्कृति</span></span></a>
        <nav aria-label="मुख्य नेविगेशन" className={menuOpen ? 'nav-links is-open' : 'nav-links'}>{[{ id: 'home', label: 'मुख्य पृष्ठ' }, { id: 'scriptures', label: 'ग्रंथ भंडार' }, { id: 'daily', label: 'आज का श्लोक' }, { id: 'quizzes', label: 'प्रश्नोत्तरी' }].map((item) => <a key={item.id} href={`#${item.id}`} className={activeNav === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>{item.label}</a>)}</nav>
        <div className="header-actions"><button className="icon-button saved-button" aria-label={`सहेजे गए श्लोक (${saved.length})`} onClick={() => setSavedOpen(true)}><Bookmark size={20}/>{saved.length > 0 && <span className="saved-badge">{hindiNumber(saved.length)}</span>}</button><a href="#scriptures" className="header-cta" onClick={() => navigate('scriptures')}><BookOpen size={16}/> अध्ययन आरंभ करें</a><button className="icon-button menu-button" aria-label={menuOpen ? 'मेन्यू बंद करें' : 'मेन्यू खोलें'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button></div>
      </div>
    </header>
    <main id="main">
      <section className="hero" id="home">
        <div className="hero-pattern" aria-hidden="true"/>
        <div className="container hero-inner">
          <div className="hero-copy"><div className="eyebrow"><span className="little-line"/> सनातन संस्कृति का दिव्य संगम</div><h1>शाश्वत ज्ञान,<br/><span>आत्मा का प्रकाश।</span></h1><p className="hero-description">ऋषियों की वाणी, जीवन का मार्गदर्शन।<br/>पवित्र ग्रंथों के संस्कृत श्लोक और सरल हिंदी भावार्थ के साथ<br className="desktop-break"/> खोजिए अपनी आध्यात्मिक यात्रा का अगला अध्याय।</p><div className="hero-buttons"><a href="#scriptures" className="button primary" onClick={() => navigate('scriptures')}>ग्रंथों का अन्वेषण करें <ArrowUpRight size={19}/></a><a href="#daily" className="text-link" onClick={() => navigate('daily')}><Sun size={19}/> आज का श्लोक <ArrowRight size={16}/></a></div><div className="hero-stats"><div><strong>०५</strong><span>पवित्र ग्रंथ</span></div><div><strong>{hindiNumber(allVerseIds.length).padStart(2, '०')}</strong><span>चयनित श्लोक</span></div><div><strong>०५</strong><span>ज्ञान प्रश्नोत्तरियाँ</span></div></div></div>
          <div className="hero-art"><img src={`${import.meta.env.BASE_URL}sacred-temple.svg`} width="1000" height="780" alt="उगते सूर्य के प्रकाश में नदी तट पर मंदिरों का मौलिक चित्र" fetchPriority="high"/><div className="art-caption"><span/> धर्मो रक्षति रक्षितः <span/></div></div>
        </div>
        <div className="hero-bottom"><span/> <Lotus/> <span/></div>
      </section>

      <section className="library-section section" id="scriptures">
        <div className="container"><div className="section-heading"><div><div className="eyebrow">॥ पवित्र ग्रंथ भंडार ॥</div><h2>ज्ञान के मूल स्रोत</h2><p>हज़ारों वर्षों की परंपरा से, आपके जीवन के लिए।</p></div><span className="section-side-note"><BookOpen size={18}/> पढ़ें · समझें · आत्मसात करें</span></div>
          <div className="library-toolbar"><div className="category-tabs" aria-label="ग्रंथ चुनें">{categories.map((item) => <button key={item.id} className={category === item.id ? 'category-tab selected' : 'category-tab'} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><label className="search-box"><Search size={18}/><input type="search" placeholder="ग्रंथ या श्लोक खोजें…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="ग्रंथ या श्लोक खोजें"/></label></div>
          <div className="book-grid">{filtered.map((book) => <article className={`book-card book-${book.id}`} key={book.id}><div className="book-art"><span className="book-number">{hindiNumber(scriptures.indexOf(book) + 1).padStart(2, '०')}</span><SacredSymbol type={book.id}/><span className="book-art-bottom">॥ {book.deity} ॥</span></div><div className="book-copy"><span className="book-theme">{book.theme}</span><h3>{book.title}</h3><p>{book.description}</p><div className="book-card-footer"><span>{hindiNumber(book.verses.length)} चयनित श्लोक</span><button className="round-arrow" onClick={() => openBook(book)} aria-label={`${book.title} पढ़ें`}><ArrowUpRight size={20}/></button></div></div></article>)}</div>
          {filtered.length === 0 && <div className="empty-state" role="status"><Search size={30}/><h3>इस खोज से कोई ग्रंथ नहीं मिला</h3><p>कोई दूसरा शब्द आज़माएँ या सभी ग्रंथ देखें।</p><button className="button secondary" onClick={() => { setQuery(''); setCategory('all'); }}>सभी ग्रंथ देखें</button></div>}
          <p className="library-note"><Sparkles size={15}/> प्रत्येक श्लोक के साथ सरल हिंदी भावार्थ और मूल पाठ का संदर्भ।</p>
        </div>
      </section>

      <section className="daily-section" id="daily"><div className="container"><div className="daily-card"><div className="daily-intro"><div className="eyebrow"><Sun size={17}/> आज का चिंतन</div><h2>एक श्लोक,<br/>अनन्त प्रेरणा।</h2><p>दिन की शुरुआत करें<br/>ज्ञान के एक उजाले के साथ।</p><button className="daily-read" onClick={() => setReader({ book: selectedDaily.book, index: selectedDaily.book.verses.indexOf(selectedDaily.verse) })}>भावार्थ सहित पढ़ें <ArrowRight size={17}/></button></div><div className="daily-verse"><span className="quote-mark" aria-hidden="true">“</span><p className="sanskrit" lang="sa">{selectedDaily.verse.sanskrit}</p><p className="daily-reference">— {selectedDaily.book.title} · {selectedDaily.verse.reference}</p><div className="daily-actions"><span>मनन करें, जीवन में उतारें।</span><button className="icon-button" onClick={() => toggleSaved(selectedDaily.verse.id)} aria-label={saved.includes(selectedDaily.verse.id) ? 'आज का श्लोक हटाएँ' : 'आज का श्लोक सहेजें'} aria-pressed={saved.includes(selectedDaily.verse.id)}><Bookmark size={19} fill={saved.includes(selectedDaily.verse.id) ? 'currentColor' : 'none'}/></button><button className="icon-button" onClick={() => copyVerse(selectedDaily.book, selectedDaily.verse)} aria-label="आज के श्लोक की प्रतिलिपि बनाएँ"><Copy size={18}/></button></div></div><Lotus className="daily-lotus"/></div></div></section>

      <section className="quiz-section section" id="quizzes"><div className="container"><div className="section-heading"><div><div className="eyebrow">॥ ज्ञान की परख ॥</div><h2>कितना जानते हैं आप?</h2><p>पाँच रोचक प्रश्नोत्तरियों के साथ जानें, सीखें और आगे बढ़ें।</p></div><span className="quiz-total"><Sparkles size={17}/> २५ प्रश्न · अनन्त सीख</span></div><div className="quiz-grid">{quizzes.map((item, index) => <button key={item.id} className="quiz-card" onClick={() => setQuiz(item)}><span className={`quiz-icon quiz-icon-${index}`}><SacredSymbol type={item.id === 'traditions' ? 'bhagavata' : item.id}/></span><span className="quiz-card-content"><span className="quiz-mini-label">प्रश्नोत्तरी {hindiNumber(index + 1).padStart(2, '०')}</span><strong>{item.title}</strong><span className="quiz-subtitle">{item.subtitle}</span><span className="quiz-question-count">{hindiNumber(item.questions.length)} प्रश्न <span>·</span> लगभग २ मिनट</span></span><ArrowUpRight className="quiz-arrow" size={21}/></button>)}</div></div></section>

      <section className="about-section" id="about"><div className="container about-inner"><div className="about-emblem"><Lotus/></div><div><div className="eyebrow">हमारा संकल्प</div><h2>परंपरा से जुड़ें। ज्ञान से समृद्ध हों।</h2><p>अनन्त सनातन एक विनम्र प्रयास है—सनातन धर्म के शाश्वत ज्ञान को सरल हिंदी में सब तक पहुँचाने का। यहाँ दिए गए हिंदी अर्थ अध्ययन के लिए लिखे गए भावार्थ हैं; विस्तृत समझ के लिए मूल ग्रंथ और प्रामाणिक टीकाएँ पढ़ें।</p></div><div className="creator"><span>सप्रेम निर्मित</span><strong>वैभव ठाकुर</strong><span lang="en">Vaibhav Thakur</span></div></div></section>
    </main>
    <footer className="site-footer"><div className="container footer-top"><a href="#home" className="brand" onClick={() => navigate('home')}><span className="brand-symbol">ॐ</span><span><span className="brand-name">अनन्त सनातन</span><span className="brand-tagline">ज्ञान अनन्त है। यात्रा भी।</span></span></a><p>॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥</p><a href="https://github.com/Vaibhav222209/Sanatan" target="_blank" rel="noreferrer">GitHub पर देखें <ArrowUpRight size={16}/></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} अनन्त सनातन · निर्माता: वैभव ठाकुर</span><a href="#about">इस प्रयास के बारे में <Heart size={12}/></a></div></footer>

    {reader && <Reader reader={reader} setReader={setReader} onClose={() => setReader(null)} saved={saved} toggleSaved={toggleSaved} copyVerse={copyVerse}/>}
    {quiz && <Quiz key={quiz.id} quiz={quiz} onClose={() => setQuiz(null)}/>}
    {savedOpen && <Dialog title="सहेजे गए श्लोक" onClose={() => setSavedOpen(false)} className="saved-dialog"><div className="eyebrow"><Bookmark size={16}/> आपका संग्रह</div><h2>सहेजे गए श्लोक</h2><p className="dialog-description">ये श्लोक इसी ब्राउज़र में सहेजे जाते हैं।</p>{saved.length === 0 ? <div className="empty-state"><Bookmark size={32}/><h3>आपका संग्रह अभी खाली है</h3><p>पढ़ते समय बुकमार्क चिह्न दबाकर पसंदीदा श्लोक जोड़ें।</p><button className="button primary" onClick={() => { setSavedOpen(false); document.getElementById('scriptures').scrollIntoView({ behavior: 'smooth' }); }}>ग्रंथ देखें <ArrowRight size={17}/></button></div> : <div className="saved-list">{scriptures.flatMap((book) => book.verses.filter((verse) => saved.includes(verse.id)).map((verse) => <div className="saved-verse" key={verse.id}><button className="saved-verse-open" onClick={() => { setSavedOpen(false); setReader({ book, index: book.verses.indexOf(verse) }); }}><span>{book.title} · {verse.reference}</span><p lang="sa">{verse.sanskrit}</p></button><button className="icon-button" aria-label={`${verse.reference} संग्रह से हटाएँ`} onClick={() => toggleSaved(verse.id)}><X size={18}/></button></div>))}</div>}</Dialog>}
    {toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}
  </>;
}

function Reader({ reader, setReader, onClose, saved, toggleSaved, copyVerse }) {
  const { book, index } = reader;
  const verse = book.verses[index];
  const [fontSize, setFontSize] = useState(1);
  return <Dialog title={`${book.title} — श्लोक अध्ययन`} onClose={onClose} className="reader-dialog"><div className="reader-title"><SacredSymbol type={book.id}/><div><div className="eyebrow">पवित्र ग्रंथ भंडार</div><h2>{book.title}</h2><p>{book.subtitle}</p></div></div><div className="reader-toolbar"><span>श्लोक {hindiNumber(index + 1)} / {hindiNumber(book.verses.length)}</span><div className="reader-controls"><button className="font-control" aria-label="अक्षर छोटे करें" onClick={() => setFontSize(Math.max(.85, +(fontSize - .1).toFixed(2)))} disabled={fontSize <= .85}>अ−</button><button className="font-control" aria-label="अक्षर बड़े करें" onClick={() => setFontSize(Math.min(1.4, +(fontSize + .1).toFixed(2)))} disabled={fontSize >= 1.4}>अ+</button><span className="toolbar-divider"/><button className="icon-button" aria-label={saved.includes(verse.id) ? 'श्लोक संग्रह से हटाएँ' : 'श्लोक सहेजें'} aria-pressed={saved.includes(verse.id)} onClick={() => toggleSaved(verse.id)}><Bookmark size={19} fill={saved.includes(verse.id) ? 'currentColor' : 'none'}/></button><button className="icon-button" aria-label="श्लोक की प्रतिलिपि बनाएँ" onClick={() => copyVerse(book, verse)}><Copy size={18}/></button></div></div><div className="reader-content" style={{ '--reading-scale': fontSize }}><div className="verse-label">॥ मूल संस्कृत श्लोक ॥</div><p className="reader-sanskrit" lang="sa">{verse.sanskrit}</p><p className="reader-reference">{verse.reference}</p><div className="translation-block"><h3><Sparkles size={17}/> सरल हिंदी भावार्थ</h3><p>{verse.translation}</p></div><a className="source-link" href={verse.sourceUrl || book.sourceUrl} target="_blank" rel="noreferrer">मूल पाठ का स्रोत <ExternalLink size={14}/></a><p className="source-note">{book.sourceNote} विभिन्न संस्करणों में पाठ और श्लोक-क्रम में थोड़ा अंतर हो सकता है।</p></div><div className="reader-navigation"><button className="button secondary" onClick={() => setReader({ book, index: index - 1 })} disabled={index === 0}><ChevronLeft size={17}/> पिछला श्लोक</button><div className="verse-dots">{book.verses.map((item, verseIndex) => <button key={item.id} aria-label={`श्लोक ${hindiNumber(verseIndex + 1)} पढ़ें`} aria-current={verseIndex === index ? 'step' : undefined} className={verseIndex === index ? 'selected' : ''} onClick={() => setReader({ book, index: verseIndex })}/>)}</div><button className="button primary" onClick={() => setReader({ book, index: index + 1 })} disabled={index === book.verses.length - 1}>अगला श्लोक <ChevronRight size={17}/></button></div></Dialog>;
}

function Quiz({ quiz, onClose }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const question = quiz.questions[index];
  const selected = answers[index];
  const answered = selected !== undefined;
  const score = answers.reduce((sum, answer, position) => sum + Number(answer === quiz.questions[position].answer), 0);
  const headingRef = useRef(null);
  function next() {
    if (index === quiz.questions.length - 1) setFinished(true);
    else setIndex(index + 1);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  function restart() { setIndex(0); setAnswers([]); setFinished(false); requestAnimationFrame(() => headingRef.current?.focus()); }
  return <Dialog title={quiz.title} onClose={onClose} className="quiz-dialog"><div className="eyebrow"><Sparkles size={16}/> ज्ञान की परख</div><h2>{quiz.title}</h2><p className="dialog-description">{quiz.subtitle}</p>{finished ? <div className="quiz-result"><div className="trophy-circle"><Trophy size={42}/></div><h3 ref={headingRef} tabIndex={-1}>{score === quiz.questions.length ? 'अद्भुत! पूर्ण ज्ञानांक।' : score >= 3 ? 'बहुत अच्छा प्रयास!' : 'सीखने की यात्रा जारी रखें!'}</h3><p className="result-score">{hindiNumber(score)} <span>/ {hindiNumber(quiz.questions.length)}</span></p><p>आपने {hindiNumber(quiz.questions.length)} में से {hindiNumber(score)} प्रश्नों के सही उत्तर दिए।<br/>हर नया प्रश्न, ज्ञान की ओर एक कदम।</p><div className="result-review">{quiz.questions.map((item, position) => <div key={item.question}><span className={answers[position] === item.answer ? 'review-correct' : 'review-incorrect'}>{answers[position] === item.answer ? <Check size={16}/> : <X size={16}/>}</span><p><strong>{item.question}</strong><span>सही उत्तर: {item.options[item.answer]}</span></p></div>)}</div><div className="result-buttons"><button className="button secondary" onClick={restart}><RotateCcw size={17}/> फिर से खेलें</button><button className="button primary" onClick={onClose}>समाप्त करें <Check size={17}/></button></div></div> : <><div className="quiz-progress-label"><span>प्रश्न {hindiNumber(index + 1)} / {hindiNumber(quiz.questions.length)}</span><span>अपना उत्तर चुनें</span></div><div className="quiz-progress" role="progressbar" aria-label="प्रश्नोत्तरी की प्रगति" aria-valuemin={0} aria-valuemax={quiz.questions.length} aria-valuenow={index}><span style={{ width: `${index / quiz.questions.length * 100}%` }}/></div><h3 className="quiz-question" ref={headingRef} tabIndex={-1}>{question.question}</h3><div className="quiz-options">{question.options.map((option, optionIndex) => { const correct = answered && optionIndex === question.answer; const wrong = answered && optionIndex === selected && !correct; return <button key={option} disabled={answered} className={`quiz-option ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} onClick={() => setAnswers([...answers, optionIndex])}><span className="option-letter">{['क', 'ख', 'ग', 'घ'][optionIndex]}</span><span>{option}</span>{correct ? <CheckCircle2 size={20}/> : wrong ? <X size={20}/> : null}</button>; })}</div>{answered && <div className={`answer-explanation ${selected === question.answer ? 'is-correct' : 'is-wrong'}`} role="status"><strong>{selected === question.answer ? 'सही उत्तर!' : `सही उत्तर: ${question.options[question.answer]}`}</strong><p>{question.explanation}</p></div>}<div className="quiz-next"><span><BookOpen size={15}/> यहाँ हर उत्तर एक नई सीख है।</span><button className="button primary" disabled={!answered} onClick={next}>{index === quiz.questions.length - 1 ? 'परिणाम देखें' : 'अगला प्रश्न'} <ArrowRight size={17}/></button></div></>}</Dialog>;
}

export default App;
