# अनन्त सनातन

**निर्माता: वैभव ठाकुर (Vaibhav Thakur)**

सनातन धर्म के ग्रंथों का अध्ययन करने के लिए हिंदी में बना एक सरल, सुंदर और मोबाइल-अनुकूल वेब प्रोजेक्ट। संस्कृत श्लोकों के साथ सरल हिंदी भावार्थ पढ़ें, अपने प्रिय श्लोक सहेजें और प्रश्नोत्तर के माध्यम से ज्ञान का अभ्यास करें। केसरिया रंग, कमल, मंदिर-प्रेरित चित्रांकन और देवनागरी अक्षर इसकी दृश्य पहचान हैं।

## क्या शामिल है

- **पाँच ग्रंथ, कुल १५ चयनित श्लोक:** शिव पुराण, श्रीमद्भगवद्गीता, वाल्मीकि रामायण, श्रीमद्भागवत पुराण और देवीभागवत पुराण। प्रत्येक ग्रंथ से तीन श्लोक, हिंदी भावार्थ और मूल पाठ का स्रोत दिया गया है। यह संपूर्ण ग्रंथों का संस्करण नहीं है।
- **पाँच प्रश्नोत्तर, कुल २५ प्रश्न:** गीता का ज्ञान, रामायण की यात्रा, शिव की आराधना, शक्ति की उपासना और सनातन की पहचान। हर प्रश्नोत्तर में पाँच प्रश्न, उत्तर की व्याख्या और अंतिम परिणाम मिलता है।
- ग्रंथ व श्लोक खोज, पढ़ने के लिए अक्षर आकार बदलने की सुविधा, प्रतिलिपि बनाना और दिन का चिंतन।
- प्रिय श्लोकों का संग्रह इसी ब्राउज़र के `localStorage` में सहेजा जाता है। खाते या क्लाउड सिंक की आवश्यकता नहीं है; ब्राउज़र का डेटा मिटाने पर संग्रह भी मिट जाता है।

## Local setup

**Prerequisites:** Node.js 24 या नया संस्करण और npm। इस प्रोजेक्ट को किसी डेटाबेस, API key या अलग backend सेवा की आवश्यकता नहीं है।

**Get the project**

```bash
git clone https://github.com/Vaibhav222209/Sanatan.git
cd Sanatan
```

यदि cloud environment में checkout पहले से उपलब्ध है, तो उसी का उपयोग करें:

```bash
cd /workspace/Sanatan
```

**Install dependencies**

```bash
npm ci
```

**Start development server**

```bash
npm run dev
```

Vite डिफ़ॉल्ट रूप से पोर्ट `5173` पर शुरू होता है। पोर्ट बदलने के लिए `npm run dev -- --port 5174` चलाएँ। सर्वर को रोकने के लिए `Ctrl+C` दबाएँ।

**Run tests**

```bash
npm test
```

**Browser tests**

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

यदि Chromium पहले से install है, तो उसके executable का पथ दें:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Browser tests श्लोक अध्ययन, हिंदी भावार्थ, keyboard navigation, bookmarks, सभी पाँच प्रश्नोत्तरियों के परिणाम और 320–1440px layouts की जाँच करते हैं।

**Create production build**

```bash
npm run build
```

तैयार वेबसाइट `dist/` फ़ोल्डर में बनती है।

**Preview production build**

```bash
npm run preview
```

Preview सर्वर डिफ़ॉल्ट रूप से पोर्ट `4173` पर चलता है।

## मूल पाठ और हिंदी भावार्थ

संस्कृत श्लोकों का मिलान [Sanskritworld text corpus](https://github.com/drdhaval2785/sanskritworld_texts/tree/576c09eec987a5e3dc7e679be3c9c7b06c6277fb) में उपलब्ध क्रमांकित डिजिटल पाठ से किया गया है। स्रोत को commit `576c09eec987a5e3dc7e679be3c9c7b06c6277fb` पर स्थिर रखा गया है, ताकि संदर्भ जाँचे जा सकें। हर श्लोक के अध्ययन दृश्य में संबंधित मूल पाठ का लिंक है।

| ग्रंथ | इस प्रोजेक्ट में चयन | मूल पाठ |
| --- | --- | --- |
| शिव पुराण | विद्येश्वरसंहिता १.३.१२, १.३.१८ और १.४.१६ | [शिवपुराण पाठ](https://github.com/drdhaval2785/sanskritworld_texts/blob/576c09eec987a5e3dc7e679be3c9c7b06c6277fb/purana/shivapurANa.txt) |
| श्रीमद्भगवद्गीता | २.४७, ४.७ और १२.१३ | [भगवद्गीता पाठ](https://github.com/drdhaval2785/sanskritworld_texts/blob/576c09eec987a5e3dc7e679be3c9c7b06c6277fb/epics/bhagavadgItA.txt) |
| वाल्मीकि रामायण | बालकाण्ड १.१.२, १.१.८ और १.१.१२ | [रामायण पाठ](https://github.com/drdhaval2785/sanskritworld_texts/blob/576c09eec987a5e3dc7e679be3c9c7b06c6277fb/epics/rAmAyaNa.txt) |
| श्रीमद्भागवत पुराण | १.२.६, ७.५.२३ और ७.११.८ | [भागवत पुराण पाठ](https://github.com/drdhaval2785/sanskritworld_texts/blob/576c09eec987a5e3dc7e679be3c9c7b06c6277fb/purana/bhAgavatapurANa.txt) |
| देवीभागवत पुराण | ७.३२.२, ७.३७.११ और ७.३७.१६ | [देवीगीता पाठ](https://github.com/drdhaval2785/sanskritworld_texts/blob/576c09eec987a5e3dc7e679be3c9c7b06c6277fb/purana/devIbhAgavata.txt) |

देवीभागवत का उपलब्ध स्रोत **देवीगीता** अंश है, जो सप्तम स्कन्ध के अध्याय ३१–४० में आता है। वेबसाइट पर इसी अंश से चयन है। श्रीमद्भागवत पुराण और देवीभागवत पुराण अलग ग्रंथ हैं। विभिन्न संस्करणों में पाठ, वर्तनी और श्लोक-क्रम में अंतर हो सकता है; ऊपर दिए संदर्भ जुड़े हुए डिजिटल स्रोत के अनुसार हैं।

हिंदी भावार्थ इस प्रोजेक्ट के लिए स्वतंत्र रूप से सरल भाषा में लिखे गए हैं। ये किसी प्रकाशित हिंदी टीका की प्रतिलिपि या शब्दशः अनुवाद नहीं हैं। संस्कृत पाठ में पठनीयता के लिए रिक्त स्थान, पंक्ति-विभाजन और दण्ड-चिह्न व्यवस्थित किए गए हैं।

## Deployment

यह React और Vite पर बनी स्थिर वेबसाइट है। `npm run build` के बाद `dist/` की सामग्री किसी भी static hosting सेवा पर प्रकाशित की जा सकती है। `vite.config.js` में `base: './'` रखा गया है, जिससे `/Sanatan/` जैसे उपपथ पर भी assets सही मिलते हैं। हिंदी fonts वेबसाइट के build में शामिल होते हैं; उन्हें पढ़ने के लिए Google Fonts से runtime request नहीं की जाती।

### GitHub Pages (वैकल्पिक)

1. GitHub repository में **Settings → Pages → Build and deployment** खोलें।
2. **Source** के लिए **GitHub Actions** चुनें।
3. **Actions → Deploy to GitHub Pages → Run workflow** चुनें और `main` branch पर चलाएँ। यह workflow `npm ci`, `npm test` और `npm run build` के बाद `dist/` को Pages पर deploy करता है। Deployment केवल इसे manually चलाने पर होता है।
4. Deployment सफल होने पर GitHub Pages में दिखाई देने वाले प्रकाशित URL का उपयोग करें। Repository में code push होना और वेबसाइट का Pages पर प्रकाशित होना अलग चरण हैं।

## Project structure

```text
src/
  App.jsx                 मुख्य पृष्ठ और अध्ययन/प्रश्नोत्तर दृश्य
  data/
    scriptures.js         श्लोक, हिंदी भावार्थ और मूल स्रोत
    quizzes.js            पाँच विषयों के प्रश्न और व्याख्याएँ
public/                   वेबसाइट के स्थिर assets
tests/                    content और library logic की जाँच
e2e/                      browser में functional और responsive जाँच
.github/workflows/        CI और वैकल्पिक Pages deployment
vite.config.js            Vite और deployment base configuration
```

नए श्लोक जोड़ते समय उनका सही ग्रंथ, अध्याय और श्लोक-संदर्भ जाँचें तथा मूल पाठ का लिंक और अपना हिंदी भावार्थ जोड़ें।
