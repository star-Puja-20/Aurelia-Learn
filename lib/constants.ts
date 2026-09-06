import type { LearningLevel, LevelConfig } from './types'

// ─── Alphabet data ────────────────────────────────────────────
export const ALPHABET_DATA: Array<{
  letter: string
  uppercase: string
  phonetic: string
  emoji: string
  word: string
}> = [
  { letter: 'a', uppercase: 'A', phonetic: '/æ/', emoji: '🍎', word: 'apple' },
  { letter: 'b', uppercase: 'B', phonetic: '/b/', emoji: '🎈', word: 'balloon' },
  { letter: 'c', uppercase: 'C', phonetic: '/k/', emoji: '🐱', word: 'cat' },
  { letter: 'd', uppercase: 'D', phonetic: '/d/', emoji: '🐶', word: 'dog' },
  { letter: 'e', uppercase: 'E', phonetic: '/ɛ/', emoji: '🥚', word: 'egg' },
  { letter: 'f', uppercase: 'F', phonetic: '/f/', emoji: '🐸', word: 'frog' },
  { letter: 'g', uppercase: 'G', phonetic: '/ɡ/', emoji: '🍇', word: 'grapes' },
  { letter: 'h', uppercase: 'H', phonetic: '/h/', emoji: '🏠', word: 'house' },
  { letter: 'i', uppercase: 'I', phonetic: '/ɪ/', emoji: '🍦', word: 'ice cream' },
  { letter: 'j', uppercase: 'J', phonetic: '/dʒ/', emoji: '🤹', word: 'juggle' },
  { letter: 'k', uppercase: 'K', phonetic: '/k/', emoji: '🪁', word: 'kite' },
  { letter: 'l', uppercase: 'L', phonetic: '/l/', emoji: '🦁', word: 'lion' },
  { letter: 'm', uppercase: 'M', phonetic: '/m/', emoji: '🌙', word: 'moon' },
  { letter: 'n', uppercase: 'N', phonetic: '/n/', emoji: '🏕️', word: 'nest' },
  { letter: 'o', uppercase: 'O', phonetic: '/ɒ/', emoji: '🐙', word: 'octopus' },
  { letter: 'p', uppercase: 'P', phonetic: '/p/', emoji: '🐧', word: 'penguin' },
  { letter: 'q', uppercase: 'Q', phonetic: '/kw/', emoji: '👸', word: 'queen' },
  { letter: 'r', uppercase: 'R', phonetic: '/r/', emoji: '🌈', word: 'rainbow' },
  { letter: 's', uppercase: 'S', phonetic: '/s/', emoji: '⭐', word: 'star' },
  { letter: 't', uppercase: 'T', phonetic: '/t/', emoji: '🐢', word: 'turtle' },
  { letter: 'u', uppercase: 'U', phonetic: '/ʌ/', emoji: '☂️', word: 'umbrella' },
  { letter: 'v', uppercase: 'V', phonetic: '/v/', emoji: '🎻', word: 'violin' },
  { letter: 'w', uppercase: 'W', phonetic: '/w/', emoji: '🐳', word: 'whale' },
  { letter: 'x', uppercase: 'X', phonetic: '/ks/', emoji: '🎸', word: 'xylophone' },
  { letter: 'y', uppercase: 'Y', phonetic: '/j/', emoji: '🪀', word: 'yo-yo' },
  { letter: 'z', uppercase: 'Z', phonetic: '/z/', emoji: '🦓', word: 'zebra' },
]

// ─── Word categories ──────────────────────────────────────────
export const WORD_CATEGORIES = {
  animals: {
    label: 'Animals',
    emoji: '🐾',
    words: ['cat', 'dog', 'bird', 'fish', 'lion', 'bear', 'frog', 'duck'],
  },
  food: {
    label: 'Food',
    emoji: '🍎',
    words: ['apple', 'cake', 'milk', 'rice', 'egg', 'bread', 'soup', 'fish'],
  },
  colours: {
    label: 'Colours',
    emoji: '🎨',
    words: ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'white'],
  },
  numbers: {
    label: 'Numbers',
    emoji: '🔢',
    words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
  },
  family: {
    label: 'Family',
    emoji: '👨‍👩‍👧',
    words: ['mum', 'dad', 'sister', 'brother', 'grandma', 'grandpa', 'baby', 'family'],
  },
  body: {
    label: 'Body',
    emoji: '🤗',
    words: ['head', 'hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'arm'],
  },
}

// ─── Sentence data ────────────────────────────────────────────
export const SENTENCE_PATTERNS = [
  { pattern: 'I am ___', examples: ['I am happy.', 'I am a student.', 'I am six years old.'] },
  { pattern: 'I like ___', examples: ['I like cats.', 'I like to play.', 'I like apples.'] },
  { pattern: 'The ___ is ___', examples: ['The dog is big.', 'The sky is blue.', 'The cake is sweet.'] },
  { pattern: 'I can ___', examples: ['I can run.', 'I can swim.', 'I can read a book.'] },
  { pattern: 'Where is the ___?', examples: ['Where is the ball?', 'Where is my bag?', 'Where is the cat?'] },
]

// ─── Stories ──────────────────────────────────────────────────
export const STORIES = [
  {
    id: 'story_1',
    title: 'The Little Star',
    level: 'story' as LearningLevel,
    coverEmoji: '⭐',
    pages: [
      { text: 'There was a little star who lived in the sky. Her name was Stella.', image: '🌟' },
      { text: 'Stella loved to shine. Every night she made the sky bright and beautiful.', image: '✨' },
      { text: 'One day, a dark cloud came. Stella was very sad and hid behind it.', image: '⛅' },
      { text: 'Her friends, the moon and the sun, called out: "Stella, please come out!"', image: '🌙' },
      { text: 'Stella was brave. She shone with all her heart. The cloud went away!', image: '⭐' },
      { text: 'The whole sky cheered. Stella smiled. She knew she was brave and bright.', image: '🌟' },
    ],
    comprehension: [
      { question: 'What is the star\'s name?', options: ['Luna', 'Stella', 'Nova', 'Bella'], answer: 'Stella' },
      { question: 'Why was Stella sad?', options: ['She was tired', 'A dark cloud came', 'She lost her friends', 'It was raining'], answer: 'A dark cloud came' },
      { question: 'Who called out to Stella?', options: ['The rain and wind', 'The sun and moon', 'Other stars', 'A rainbow'], answer: 'The sun and moon' },
    ],
  },
  {
    id: 'story_2',
    title: 'The Friendly Dragon',
    level: 'story' as LearningLevel,
    coverEmoji: '🐉',
    pages: [
      { text: 'In a green valley there lived a dragon named Pip. Pip was small and green.', image: '🐉' },
      { text: 'All the animals were scared of Pip because dragons breathe fire.', image: '🔥' },
      { text: 'But Pip only breathed tiny bubbles! The animals laughed when they saw this.', image: '🫧' },
      { text: 'One cold winter, all the animals had no fire to keep warm.', image: '❄️' },
      { text: 'Pip tried very hard. One big breath — and a flame came out! Everyone cheered.', image: '🔥' },
      { text: 'From that day, Pip was the animals\' best friend and kept them warm and safe.', image: '🐉' },
    ],
    comprehension: [
      { question: 'What colour is Pip?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 'Green' },
      { question: 'What did Pip breathe instead of fire?', options: ['Water', 'Bubbles', 'Smoke', 'Wind'], answer: 'Bubbles' },
      { question: 'Why did the animals need Pip\'s help?', options: ['They were lost', 'They had no food', 'They had no fire to keep warm', 'They were scared'], answer: 'They had no fire to keep warm' },
    ],
  },
]

// ─── Level config ─────────────────────────────────────────────
export const LEVEL_CONFIG: Record<LearningLevel, LevelConfig> = {
  letter: {
    key: 'letter',
    label: 'Letter',
    description: 'Learning letters A–Z, phonics, and letter sounds',
    color: '#039BE5',
    bgColor: '#E1F5FE',
    borderColor: '#B3E5FC',
    icon: '🔤',
    order: 1,
  },
  word: {
    key: 'word',
    label: 'Word',
    description: 'Building vocabulary with common sight words',
    color: '#43A047',
    bgColor: '#F1F8E9',
    borderColor: '#C8E6C9',
    icon: '📝',
    order: 2,
  },
  sentence: {
    key: 'sentence',
    label: 'Sentence',
    description: 'Forming simple sentences and basic grammar',
    color: '#FFB300',
    bgColor: '#FFFDE7',
    borderColor: '#FFF9C4',
    icon: '💬',
    order: 3,
  },
  story: {
    key: 'story',
    label: 'Story',
    description: 'Reading short stories and answering questions',
    color: '#E64A19',
    bgColor: '#FFF3F2',
    borderColor: '#FFCCBC',
    icon: '📖',
    order: 4,
  },
  conversation: {
    key: 'conversation',
    label: 'Conversation',
    description: 'Practising spoken English in real dialogues',
    color: '#283593',
    bgColor: '#E8EAF6',
    borderColor: '#C5CAE9',
    icon: '🗣️',
    order: 5,
  },
}

export const LEVELS_ORDERED: LearningLevel[] = ['letter', 'word', 'sentence', 'story', 'conversation']

// ─── Avatar options ───────────────────────────────────────────
export const AVATAR_EMOJIS = ['🐱', '🐶', '🐸', '🦊', '🐼', '🐨', '🦁', '🐯', '🐻', '🦄', '🐧', '🦋']

export const AVATAR_COLORS = [
  '#4FC3F7', '#FF8A80', '#A5D6A7', '#FFD54F',
  '#CE93D8', '#80DEEA', '#FFAB91', '#80CBC4',
  '#F48FB1', '#AED581', '#FFE082', '#B39DDB',
]

