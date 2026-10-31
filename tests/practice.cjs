const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const elements=new Map();
const element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',style:{},value:'',classList:{toggle(){},add(){},remove(){}}});return elements.get(key);};
const storage=new Map();
const context=vm.createContext({console,setTimeout:()=>0,clearTimeout(){},window:{},document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},assert});
for(const f of ['data.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),context);
vm.runInContext(`
assert.equal(WORDS.length,60);
assert.equal(new Set(WORDS.map(w=>w.id)).size,60);
assert.equal(QUESTIONS.length,70);
for(const q of QUESTIONS){assert(q.options.includes(q.answer));assert.equal(new Set(q.options).size,q.options.length);assert(q.explanation.length>10);}
for(const t of Object.keys(TOPICS))assert.equal(QUESTIONS.filter(q=>q.topic===t).length,10);
for(const v of ['inicio','palabras','relacionar','gramatica','hablar','repasar','progreso']){go(v);assert(main.innerHTML.length>100);}
assert.equal(phase,2);
for(const id of [1,2]){selectPhase(id);assert.equal(mixedQuestions().length,12);assert(mixedQuestions().every(q=>PHASES[id].topics.includes(q.topic)));assert.equal(topic,PHASES[id].topics[0]);grammar();assert(main.innerHTML.includes(PHASES[id].title));}
selectPhase(2);
assert.equal(JSON.parse(localStorage.getItem('wordstep-v1')).phase,2);
assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,70);
startQuiz(QUESTIONS.slice(40,42),'Phase 2');
let newQ=quiz.items[0];answer(newQ.options.findIndex(o=>o!==newQ.answer));assert(state.errors.includes(newQ.id));reviewQuiz();newQ=quiz.items[0];answer(newQ.options.indexOf(newQ.answer));assert(!state.errors.includes(newQ.id));
state.attempts=0;state.correct=0;
startQuiz(QUESTIONS.slice(0,2),'Test');
let q=quiz.items[0];answer(q.options.findIndex(o=>o!==q.answer));assert(state.errors.includes(q.id));assert.equal(state.attempts,1);
answer(0);assert.equal(state.attempts,1,'Repeated taps must not increase attempts');
const wrongId=q.id;reviewQuiz();q=quiz.items[0];answer(q.options.indexOf(q.answer));assert(!state.errors.includes(wrongId));
quiz.index++;quizView();assert(main.innerHTML.includes('SESIÓN COMPLETADA'));
wordFilter='pending';state.known=WORDS.map(w=>w.id);go('palabras');assert.equal(wordPool.length,0);
wordFilter='all';wordSearch='borrow';words();assert.equal(wordPool.length,1);assert.equal(wordPool[0].en,'borrow');
wordSearch='zzzznotaword';words();assert.equal(wordPool.length,0);
newMatch();go('relacionar');let id=match.batch[0].id;const before=state.correct;chooseMatch('right',id);chooseMatch('left',id);assert(match.done.includes(id));assert.equal(state.correct,before+1);
chooseMatch('left',id);assert.equal(state.correct,before+1);
for(const w of match.batch.slice(1)){chooseMatch('left',w.id);chooseMatch('right',w.id);}assert.equal(match.done.length,5);
state.errors=[WORDS[0].id];reviewQuiz();assert.equal(quiz.items[0].answer,WORDS[0].es);answer(quiz.items[0].options.indexOf(WORDS[0].es));assert.equal(state.errors.length,0);
assert(JSON.parse(localStorage.getItem('wordstep-v1')).attempts>0);
assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
console.log('PASS: data integrity, all views, quiz scoring, repeated taps, error review, word filters, matching, persistence and escaping.');
`,context);
