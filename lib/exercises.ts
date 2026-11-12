import type { LearningLevel } from './types'

// ---------------------------------------------------------------------------
// Exercise content for the student learning screen.
// Every level has Learn + Reading + Listening + Written sets (two sets per skill).
// ---------------------------------------------------------------------------

export type Skill = 'reading' | 'listening' | 'written'
export type ResultSkill = Skill | 'learn'

interface ItemBase {
  prompt: string
  display?: string   // large text or emoji shown above the question
  passage?: string   // text to read before answering (reading items)
  say?: string       // text spoken aloud (listening items)
  hearOnly?: boolean // listening: hide the spoken text, show only a play button
}
export interface ChoiceItem extends ItemBase { kind: 'choice'; options: string[]; answer: string }
export interface TypeItem extends ItemBase { kind: 'type'; answers: string[]; caseSensitive?: boolean; hint?: string }
export interface OrderItem extends ItemBase { kind: 'order'; parts: string[] }
export type ExerciseItem = ChoiceItem | TypeItem | OrderItem

export interface ExerciseSet {
  id: string
  level: LearningLevel
  skill: Skill
  title: string
  emoji: string
  items: ExerciseItem[]
}

type Extra = Partial<Omit<ItemBase, 'prompt'>>
const c = (prompt: string, options: string[], answer: string, extra: Extra = {}): ChoiceItem => ({ kind: 'choice', prompt, options, answer, ...extra })
const t = (prompt: string, answers: string[], extra: Extra & { caseSensitive?: boolean; hint?: string } = {}): TypeItem => ({ kind: 'type', prompt, answers, ...extra })
const o = (prompt: string, parts: string[], extra: Extra = {}): OrderItem => ({ kind: 'order', prompt, parts, ...extra })

const set = (level: LearningLevel, skill: Skill, variant: 'a' | 'b', title: string, emoji: string, items: ExerciseItem[]): ExerciseSet =>
  ({ id: `${level}-${skill}-${variant}`, level, skill, title, emoji, items })

// ── Stories used by several sets ────────────────────────────────────────────
const MIA = 'Mia has a small garden. She plants a seed. Every day she gives it water. After one week, a red flower grows.'
const KITE = 'Ben has a blue kite. The wind is strong today. The kite flies high above the trees. Suddenly the string breaks! Ben runs after his kite and finds it in the park.'
const MARKET = 'Lily and her dad go to the market on Saturday. They buy apples, bread and milk. Lily carries the bread. On the way home, it starts to rain.'
const PUPPY = 'Tom has a puppy called Max. Max likes to chase a yellow ball in the garden. One day the ball goes over the fence. Max jumps over and brings it back.'
const FOOTBALL = 'Ali: Hi Sara! Do you like football?\nSara: Yes! I play every Saturday.\nAli: Great! Can I play with you?\nSara: Of course. See you at ten.'
const ICE_CREAM = 'Hello, can I have an ice cream please? Of course. Which flavour? Strawberry, please. That is two dollars.'

export const EXERCISE_SETS: ExerciseSet[] = [
  // ═══════════════ LETTER ═══════════════
  set('letter', 'reading', 'a', 'Capital and small letters', '🔠', [
    c('Which small letter matches?', ['b', 'd', 'p', 'q'], 'b', { display: 'B' }),
    c('Which small letter matches?', ['m', 'n', 'w', 'h'], 'm', { display: 'M' }),
    c('Which small letter matches?', ['s', 'z', 'c', 'e'], 's', { display: 'S' }),
    c('Which small letter matches?', ['a', 'o', 'e', 'u'], 'a', { display: 'A' }),
    c('Which small letter matches?', ['t', 'f', 'l', 'i'], 't', { display: 'T' }),
  ]),
  set('letter', 'reading', 'b', 'First letter of the word', '🔤', [
    c('Which word starts with this letter?', ['cat', 'dog', 'sun', 'hat'], 'cat', { display: 'C' }),
    c('Which word starts with this letter?', ['bed', 'pen', 'sun', 'map'], 'bed', { display: 'B' }),
    c('Which word starts with this letter?', ['dog', 'cat', 'pig', 'fox'], 'dog', { display: 'D' }),
    c('Which word starts with this letter?', ['fish', 'bird', 'ant', 'cow'], 'fish', { display: 'F' }),
    c('Which word starts with this letter?', ['sun', 'moon', 'tree', 'lamp'], 'sun', { display: 'S' }),
  ]),
  set('letter', 'listening', 'a', 'Which letter did you hear?', '👂', [
    c('Which letter did you hear?', ['B', 'D', 'P', 'T'], 'B', { say: 'The letter B.', hearOnly: true }),
    c('Which letter did you hear?', ['M', 'N', 'W', 'H'], 'M', { say: 'The letter M.', hearOnly: true }),
    c('Which letter did you hear?', ['S', 'F', 'X', 'Z'], 'S', { say: 'The letter S.', hearOnly: true }),
    c('Which letter did you hear?', ['T', 'G', 'K', 'J'], 'T', { say: 'The letter T.', hearOnly: true }),
    c('Which letter did you hear?', ['F', 'S', 'H', 'V'], 'F', { say: 'The letter F.', hearOnly: true }),
  ]),
  set('letter', 'listening', 'b', 'Starting sounds', '🎧', [
    c('What letter does the word start with?', ['s', 'm', 't', 'b'], 's', { say: 'sun', hearOnly: true }),
    c('What letter does the word start with?', ['c', 'm', 'p', 'h'], 'c', { say: 'cat', hearOnly: true }),
    c('What letter does the word start with?', ['d', 'b', 'g', 'p'], 'd', { say: 'dog', hearOnly: true }),
    c('What letter does the word start with?', ['f', 's', 'h', 'v'], 'f', { say: 'fish', hearOnly: true }),
    c('What letter does the word start with?', ['h', 'n', 'a', 't'], 'h', { say: 'hat', hearOnly: true }),
  ]),
  set('letter', 'written', 'a', 'Type the first letter', '✏️', [
    t('Type the first letter of "cat".', ['c'], { display: '🐱' }),
    t('Type the first letter of "dog".', ['d'], { display: '🐶' }),
    t('Type the first letter of "sun".', ['s'], { display: '☀️' }),
    t('Type the first letter of "fish".', ['f'], { display: '🐟' }),
    t('Type the first letter of "hat".', ['h'], { display: '🎩' }),
  ]),
  set('letter', 'written', 'b', 'Capitals and ABC order', '🔡', [
    t('Type the capital letter for this small letter.', ['G'], { display: 'g', caseSensitive: true }),
    t('Type the capital letter for this small letter.', ['K'], { display: 'k', caseSensitive: true }),
    t('Type the capital letter for this small letter.', ['R'], { display: 'r', caseSensitive: true }),
    o('Put the letters in ABC order.', ['a', 'b', 'c']),
    o('Put the letters in ABC order.', ['d', 'e', 'f']),
  ]),

  // ═══════════════ WORD ═══════════════
  set('word', 'reading', 'a', 'Match the picture', '🖼️', [
    c('Which word matches the picture?', ['cat', 'cap', 'car', 'can'], 'cat', { display: '🐱' }),
    c('Which word matches the picture?', ['dog', 'dot', 'dig', 'den'], 'dog', { display: '🐶' }),
    c('Which word matches the picture?', ['fish', 'dish', 'fist', 'fan'], 'fish', { display: '🐟' }),
    c('Which word matches the picture?', ['sun', 'sand', 'soap', 'six'], 'sun', { display: '☀️' }),
    c('Which word matches the picture?', ['apple', 'ant', 'arm', 'axe'], 'apple', { display: '🍎' }),
  ]),
  set('word', 'reading', 'b', 'Read the clue', '🔍', [
    c('Read the clue. What is it?', ['dog', 'cat', 'fish', 'bird'], 'dog', { passage: 'It barks and wags its tail.' }),
    c('Read the clue. What is it?', ['fish', 'cow', 'bee', 'hen'], 'fish', { passage: 'It swims in water and has fins.' }),
    c('Read the clue. What is it?', ['sun', 'moon', 'rain', 'wind'], 'sun', { passage: 'It is hot and shines in the sky.' }),
    c('Read the clue. What is it?', ['book', 'box', 'bed', 'bus'], 'book', { passage: 'You read it. It has pages.' }),
    c('Read the clue. What is it?', ['bike', 'bag', 'hat', 'bee'], 'bike', { passage: 'It has two wheels and you can ride it.' }),
  ]),
  set('word', 'listening', 'a', 'Hear and choose the picture', '👂', [
    c('Which picture did you hear?', ['🐱', '🐶', '🐟', '🐦'], '🐶', { say: 'dog', hearOnly: true }),
    c('Which picture did you hear?', ['🐟', '🐸', '🐴', '🐘'], '🐟', { say: 'fish', hearOnly: true }),
    c('Which picture did you hear?', ['☀️', '🌙', '⭐', '☁️'], '☀️', { say: 'sun', hearOnly: true }),
    c('Which picture did you hear?', ['🍎', '🍌', '🍇', '🍊'], '🍎', { say: 'apple', hearOnly: true }),
    c('Which picture did you hear?', ['🐦', '🐻', '🐭', '🐷'], '🐦', { say: 'bird', hearOnly: true }),
  ]),
  set('word', 'listening', 'b', 'Hear and choose the word', '🎧', [
    c('Which word did you hear?', ['cat', 'dog', 'sun', 'hat'], 'cat', { say: 'cat', hearOnly: true }),
    c('Which word did you hear?', ['bread', 'bed', 'bird', 'brush'], 'bread', { say: 'bread', hearOnly: true }),
    c('Which word did you hear?', ['milk', 'mud', 'mat', 'mask'], 'milk', { say: 'milk', hearOnly: true }),
    c('Which word did you hear?', ['green', 'grass', 'gray', 'great'], 'green', { say: 'green', hearOnly: true }),
    c('Which word did you hear?', ['table', 'tiger', 'tape', 'toy'], 'table', { say: 'table', hearOnly: true }),
  ]),
  set('word', 'written', 'a', 'Spell the picture', '✏️', [
    t('Type the word for the picture.', ['cat'], { display: '🐱' }),
    t('Type the word for the picture.', ['dog'], { display: '🐶' }),
    t('Type the word for the picture.', ['fish'], { display: '🐟' }),
    t('Type the word for the picture.', ['sun'], { display: '☀️' }),
    t('Type the word for the picture.', ['apple'], { display: '🍎' }),
  ]),
  set('word', 'written', 'b', 'Unscramble the word', '🔀', [
    t('Unscramble the letters to make a word.', ['cat'], { display: 'tac', hint: '🐱' }),
    t('Unscramble the letters to make a word.', ['dog'], { display: 'god', hint: '🐶' }),
    t('Unscramble the letters to make a word.', ['sun'], { display: 'nus', hint: '☀️' }),
    t('Unscramble the letters to make a word.', ['fish'], { display: 'hsfi', hint: '🐟' }),
    t('Unscramble the letters to make a word.', ['book'], { display: 'kboo', hint: '📖' }),
  ]),

  // ═══════════════ SENTENCE ═══════════════
  set('sentence', 'reading', 'a', 'Fill the gap', '🧩', [
    c('Read the sentence. Pick the missing word.', ['happy', 'run', 'apple', 'blue'], 'happy', { passage: 'I am ___ today.' }),
    c('Read the sentence. Pick the missing word.', ['run', 'blue', 'apple', 'table'], 'run', { passage: 'I can ___ fast.' }),
    c('Read the sentence. Pick the missing word.', ['big', 'eat', 'sing', 'under'], 'big', { passage: 'The dog is ___.' }),
    c('Read the sentence. Pick the missing word.', ['ball', 'run', 'happy', 'fast'], 'ball', { passage: 'She has a red ___.' }),
    c('Read the sentence. Pick the missing word.', ['go', 'goes', 'going', 'gone'], 'go', { passage: 'We ___ to school.' }),
  ]),
  set('sentence', 'reading', 'b', 'Read and answer', '📃', [
    c('Where is the cat?', ['on the mat', 'in the box', 'under the bed', 'at school'], 'on the mat', { passage: 'The cat is on the mat.' }),
    c('How many balls does Sam have?', ['one', 'two', 'three', 'four'], 'two', { passage: 'Sam has two red balls.' }),
    c('Why does Tom take an umbrella?', ['It is rainy', 'It is hot', 'He is hungry', 'He is late'], 'It is rainy', { passage: 'It is rainy. Tom takes his umbrella.' }),
    c('What does Anna like?', ['apples', 'grapes', 'pears', 'plums'], 'apples', { passage: 'Anna likes apples but she does not like grapes.' }),
    c('When does the bird sing?', ['every morning', 'at night', 'at lunch', 'on Sunday'], 'every morning', { passage: 'The bird sings in the tree every morning.' }),
  ]),
  set('sentence', 'listening', 'a', 'Which sentence did you hear?', '👂', [
    c('Which sentence did you hear?', ['The cat is sleeping.', 'The cat is eating.', 'The dog is sleeping.', 'The bat is sleeping.'], 'The cat is sleeping.', { say: 'The cat is sleeping.', hearOnly: true }),
    c('Which sentence did you hear?', ['I like red apples.', 'I like red ants.', 'I like green apples.', 'I hate red apples.'], 'I like red apples.', { say: 'I like red apples.', hearOnly: true }),
    c('Which sentence did you hear?', ['We play in the park.', 'We stay in the park.', 'We play in the pool.', 'They play in the park.'], 'We play in the park.', { say: 'We play in the park.', hearOnly: true }),
    c('Which sentence did you hear?', ['She has a new bag.', 'She has a blue bag.', 'He has a new bag.', 'She has a new bat.'], 'She has a new bag.', { say: 'She has a new bag.', hearOnly: true }),
    c('Which sentence did you hear?', ['The sun is hot today.', 'The sun is high today.', 'The sea is hot today.', 'The sun is hot Monday.'], 'The sun is hot today.', { say: 'The sun is hot today.', hearOnly: true }),
  ]),
  set('sentence', 'listening', 'b', 'Listen for the missing word', '🎧', [
    c('Listen. Which word is missing?', ['swim', 'sing', 'sit', 'sew'], 'swim', { say: 'I can swim in the sea.', passage: 'I can ___ in the sea.' }),
    c('Listen. Which word is missing?', ['cooks', 'cooking', 'cake', 'cold'], 'cooks', { say: 'My mother cooks dinner.', passage: 'My mother ___ dinner.' }),
    c('Listen. Which word is missing?', ['big', 'bag', 'bug', 'beg'], 'big', { say: 'The bus is very big.', passage: 'The bus is very ___.' }),
    c('Listen. Which word is missing?', ['blue', 'black', 'brown', 'bright'], 'blue', { say: 'He wears a blue hat.', passage: 'He wears a ___ hat.' }),
    c('Listen. Which word is missing?', ['happy', 'hungry', 'hurt', 'hot'], 'happy', { say: 'They are happy.', passage: 'They are ___.' }),
  ]),
  set('sentence', 'written', 'a', 'Put the words in order', '🔀', [
    o('Put the words in order.', ['The', 'cat', 'is', 'sleeping.']),
    o('Put the words in order.', ['She', 'has', 'a', 'new', 'bag.']),
    o('Put the words in order.', ['We', 'play', 'in', 'the', 'park.']),
    o('Put the words in order.', ['My', 'dog', 'can', 'run', 'fast.']),
    o('Put the words in order.', ['I', 'like', 'red', 'apples.']),
  ]),
  set('sentence', 'written', 'b', 'Listen and type', '⌨️', [
    t('Listen and type the sentence.', ['i like cats'], { say: 'I like cats.', hearOnly: true }),
    t('Listen and type the sentence.', ['the sun is hot'], { say: 'The sun is hot.', hearOnly: true }),
    t('Listen and type the sentence.', ['we go to school'], { say: 'We go to school.', hearOnly: true }),
    t('Type the missing word.', ['reads', 'has'], { passage: 'She ___ a book.' }),
    t('Type the missing word.', ['swims', 'lives', 'is'], { passage: 'The fish ___ in the water.' }),
  ]),

  // ═══════════════ STORY ═══════════════
  set('story', 'reading', 'a', 'Mia’s garden', '🌱', [
    c('What does Mia plant?', ['a seed', 'a tree', 'a bean', 'a carrot'], 'a seed', { passage: MIA }),
    c('How often does she give it water?', ['every day', 'once a week', 'at night only', 'never'], 'every day', { passage: MIA }),
    c('What grows after one week?', ['a red flower', 'a green tree', 'a yellow bird', 'a big apple'], 'a red flower', { passage: MIA }),
    c('What size is Mia’s garden?', ['small', 'big', 'huge', 'wet'], 'small', { passage: MIA }),
    c('Which word describes Mia best?', ['caring', 'lazy', 'angry', 'sleepy'], 'caring', { passage: MIA }),
  ]),
  set('story', 'reading', 'b', 'The lost kite', '🪁', [
    c('What colour is the kite?', ['blue', 'red', 'green', 'yellow'], 'blue', { passage: KITE }),
    c('What is the weather like?', ['windy', 'snowy', 'foggy', 'calm'], 'windy', { passage: KITE }),
    c('What happens to the string?', ['It breaks', 'It grows', 'It melts', 'It turns red'], 'It breaks', { passage: KITE }),
    c('Where does Ben find the kite?', ['in the park', 'at school', 'in the sea', 'on the roof'], 'in the park', { passage: KITE }),
    c('What does Ben do after the string breaks?', ['He runs after the kite', 'He goes home', 'He sits and cries', 'He buys a new kite'], 'He runs after the kite', { passage: KITE }),
  ]),
  set('story', 'listening', 'a', 'At the market', '🛒', [
    c('Where do they go?', ['to the market', 'to school', 'to the zoo', 'to the beach'], 'to the market', { say: MARKET, hearOnly: true }),
    c('What day is it?', ['Saturday', 'Sunday', 'Monday', 'Friday'], 'Saturday', { say: MARKET, hearOnly: true }),
    c('What does Lily carry?', ['the bread', 'the milk', 'the apples', 'the umbrella'], 'the bread', { say: MARKET, hearOnly: true }),
    c('What happens on the way home?', ['It rains', 'It snows', 'They get lost', 'They meet a friend'], 'It rains', { say: MARKET, hearOnly: true }),
    c('Who goes with Lily?', ['her dad', 'her mum', 'her brother', 'her teacher'], 'her dad', { say: MARKET, hearOnly: true }),
  ]),
  set('story', 'listening', 'b', 'Max the puppy', '🐶', [
    c('What is the puppy’s name?', ['Max', 'Tom', 'Ben', 'Rex'], 'Max', { say: PUPPY, hearOnly: true }),
    c('What does Max chase?', ['a yellow ball', 'a cat', 'a bird', 'a bus'], 'a yellow ball', { say: PUPPY, hearOnly: true }),
    c('Where does Max play?', ['in the garden', 'in the kitchen', 'at the beach', 'at school'], 'in the garden', { say: PUPPY, hearOnly: true }),
    c('What happens one day?', ['The ball goes over the fence', 'Max gets lost', 'Tom is sad', 'It rains'], 'The ball goes over the fence', { say: PUPPY, hearOnly: true }),
    c('What does Max do at the end?', ['He brings the ball back', 'He sleeps', 'He hides', 'He barks at Tom'], 'He brings the ball back', { say: PUPPY, hearOnly: true }),
  ]),
  set('story', 'written', 'a', 'Short answers', '✏️', [
    t('What is the girl’s name?', ['mia'], { passage: MIA }),
    t('What does she plant? (one word)', ['seed', 'a seed'], { passage: MIA }),
    t('What colour is the flower?', ['red'], { passage: MIA }),
    t('After how long does the flower grow?', ['one week', '1 week', 'a week'], { passage: MIA }),
    t('Does Mia water the seed? Type yes or no.', ['yes'], { passage: MIA }),
  ]),
  set('story', 'written', 'b', 'Put the story in order', '📚', [
    o('Put the story in order.', ['Sam wakes up.', 'He eats breakfast.', 'He walks to school.']),
    o('Put the story in order.', ['Anna mixes the flour and eggs.', 'She puts the cake in the oven.', 'The cake is ready.', 'Everyone eats a slice.']),
    o('Put the story in order.', ['It is raining.', 'Tom opens his umbrella.', 'He walks through the puddles.', 'He gets home dry.']),
    o('Put the story in order.', ['Mia plants a seed.', 'She gives it water.', 'A flower grows.']),
    o('Put the story in order.', ['The bird builds a nest.', 'It lays three eggs.', 'The eggs hatch.', 'Baby birds sing.']),
  ]),

  // ═══════════════ CONVERSATION ═══════════════
  set('conversation', 'reading', 'a', 'Choose the best reply', '💬', [
    c('Choose the best reply.', ['I am fine, thank you.', 'It is red.', 'At seven o’clock.', 'Yes, a cat.'], 'I am fine, thank you.', { passage: '“Hello! How are you?”' }),
    c('Choose the best reply.', ['My name is Sara.', 'I am eight.', 'It is Monday.', 'Blue, please.'], 'My name is Sara.', { passage: '“What is your name?”' }),
    c('Choose the best reply.', ['I am nine years old.', 'My name is Ali.', 'I like pizza.', 'It is cold.'], 'I am nine years old.', { passage: '“How old are you?”' }),
    c('Choose the best reply.', ['Yes, please.', 'At the park.', 'Because it is big.', 'I am seven.'], 'Yes, please.', { passage: '“Would you like some water?”' }),
    c('Choose the best reply.', ['I live in a small town.', 'I am eleven.', 'Yes, I do.', 'At six.'], 'I live in a small town.', { passage: '“Where do you live?”' }),
  ]),
  set('conversation', 'reading', 'b', 'Read the dialogue', '📖', [
    c('What does Sara like?', ['football', 'tennis', 'swimming', 'reading'], 'football', { passage: FOOTBALL }),
    c('When does Sara play?', ['every Saturday', 'every Sunday', 'every day', 'at night'], 'every Saturday', { passage: FOOTBALL }),
    c('What does Ali ask?', ['Can I play with you?', 'Where is the ball?', 'Who is your teacher?', 'What time is it?'], 'Can I play with you?', { passage: FOOTBALL }),
    c('What time will they meet?', ['at ten', 'at nine', 'at noon', 'at six'], 'at ten', { passage: FOOTBALL }),
    c('How does Sara answer Ali?', ['She says yes', 'She says no', 'She is angry', 'She is late'], 'She says yes', { passage: FOOTBALL }),
  ]),
  set('conversation', 'listening', 'a', 'Hear the question', '👂', [
    c('Choose the best answer.', ['My favourite colour is blue.', 'I am seven.', 'It is Tuesday.', 'At the shop.'], 'My favourite colour is blue.', { say: 'What is your favourite colour?', hearOnly: true }),
    c('Choose the best answer.', ['It is next to the school.', 'I like books.', 'Yes, it is.', 'At night.'], 'It is next to the school.', { say: 'Where is the library?', hearOnly: true }),
    c('Choose the best answer.', ['Yes, of course.', 'On the table.', 'Nine o’clock.', 'Green.'], 'Yes, of course.', { say: 'Can you help me, please?', hearOnly: true }),
    c('Choose the best answer.', ['It is half past two.', 'It is a cat.', 'I am fine.', 'Yes, please.'], 'It is half past two.', { say: 'What time is it?', hearOnly: true }),
    c('Choose the best answer.', ['It was great, thanks.', 'It is blue.', 'I am a boy.', 'At the park.'], 'It was great, thanks.', { say: 'How was your day?', hearOnly: true }),
  ]),
  set('conversation', 'listening', 'b', 'Hear the dialogue', '🍦', [
    c('What does Sara want?', ['an ice cream', 'a cake', 'a drink', 'a book'], 'an ice cream', { say: ICE_CREAM, hearOnly: true }),
    c('Which flavour does she choose?', ['strawberry', 'chocolate', 'vanilla', 'lemon'], 'strawberry', { say: ICE_CREAM, hearOnly: true }),
    c('How much is it?', ['two dollars', 'five dollars', 'one dollar', 'ten dollars'], 'two dollars', { say: ICE_CREAM, hearOnly: true }),
    c('Where is Sara?', ['at a shop', 'at school', 'at home', 'at a park'], 'at a shop', { say: ICE_CREAM, hearOnly: true }),
    c('Is Sara polite?', ['Yes, she says please', 'No, she is rude', 'She says nothing', 'She shouts'], 'Yes, she says please', { say: ICE_CREAM, hearOnly: true }),
  ]),
  set('conversation', 'written', 'a', 'Complete the reply', '✏️', [
    t('Type the missing word.', ['fine', 'good', 'well', 'great', 'happy', 'ok', 'okay'], { passage: '“How are you?” — “I am ___, thank you.”' }),
    t('Type the missing word.', ['name'], { passage: '“What is your name?” — “My ___ is Sam.”' }),
    t('Type the missing word.', ['welcome'], { passage: '“Thank you!” — “You are ___.”' }),
    t('Type the missing word.', ['please'], { passage: '“Can I have some water, ___?”' }),
    t('Type the missing word.', ['tomorrow', 'later', 'soon', 'again'], { passage: '“Goodbye! See you ___.”' }),
  ]),
  set('conversation', 'written', 'b', 'Build the reply', '🧱', [
    o('Put the words in order to make a reply.', ['I', 'am', 'fine,', 'thank', 'you.'], { passage: '“How are you?”' }),
    o('Put the words in order to make a reply.', ['My', 'name', 'is', 'Sam.'], { passage: '“What is your name?”' }),
    o('Put the words in order to make a reply.', ['Yes,', 'I', 'would', 'like', 'some', 'water.'], { passage: '“Would you like some water?”' }),
    o('Put the words in order to make a reply.', ['I', 'live', 'in', 'a', 'small', 'town.'], { passage: '“Where do you live?”' }),
    o('Put the words in order to make a reply.', ['It', 'is', 'half', 'past', 'two.'], { passage: '“What time is it?”' }),
  ]),
]

// ── Learn activities (guided practice, always one per level) ────────────────
export const LEARN_TITLES: Record<LearningLevel, { title: string; emoji: string }> = {
  letter: { title: 'Meet the letters', emoji: '🔤' },
  word: { title: 'Word cards', emoji: '📝' },
  sentence: { title: 'Sentence patterns', emoji: '💬' },
  story: { title: 'Story time', emoji: '📖' },
  conversation: { title: 'Talk together', emoji: '🗣️' },
}

export const SKILL_LABELS: Record<Skill, { label: string; emoji: string }> = {
  reading: { label: 'Read', emoji: '📖' },
  listening: { label: 'Listen', emoji: '👂' },
  written: { label: 'Write', emoji: '✏️' },
}

export const SKILLS: Skill[] = ['reading', 'listening', 'written']

export const learnSetId = (level: LearningLevel) => `${level}-learn`

export function setsForLevel(level: LearningLevel) {
  return EXERCISE_SETS.filter(s => s.level === level)
}

export function setById(id: string) {
  return EXERCISE_SETS.find(s => s.id === id)
}

// Every set a student can complete at a level: the learn activity plus the six exercise sets.
export function setIdsForLevel(level: LearningLevel) {
  return [learnSetId(level), ...setsForLevel(level).map(s => s.id)]
}

export const ALL_RESULT_EXERCISE_IDS = new Set(
  (['letter', 'word', 'sentence', 'story', 'conversation'] as LearningLevel[]).flatMap(setIdsForLevel),
)

export const DIALOGUES = [
  {
    title: 'Meeting a new friend',
    lines: [
      { speaker: 'Sam', text: 'Hello! My name is Sam.' },
      { speaker: 'Mia', text: 'Hi Sam! My name is Mia.' },
      { speaker: 'Sam', text: 'How are you today?' },
      { speaker: 'Mia', text: 'I am fine, thank you. And you?' },
      { speaker: 'Sam', text: 'I am great! Do you like football?' },
      { speaker: 'Mia', text: 'Yes, I do! Let us play together.' },
    ],
  },
]
