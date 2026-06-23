// questions.js
const QUESTION_BANK = {
  java: [
    {
      type: 'single',
      question: 'Which keyword is used to define a constant in Java?',
      options: ['const', 'final', 'static', 'define'],
      answer: 1
    },
    {
      type: 'single',
      question: 'What is the size of an int in Java?',
      options: ['2 bytes', '4 bytes', '8 bytes', 'depends'],
      answer: 1
    },
    {
      type: 'multi',
      question: 'Which of these are Java access modifiers?',
      options: ['private', 'protected', 'public', 'internal'],
      answer: [0, 1, 2]
    },
    {
      type: 'fill',
      question: 'The method used to start a thread in Java is _____.',
      options: [],
      answer: 'start'
    },
    {
      type: 'single',
      question: 'Which collection maintains insertion order?',
      options: ['HashSet', 'TreeSet', 'LinkedHashSet', 'HashMap'],
      answer: 2
    }
  ],
  web: [
    {
      type: 'single',
      question: 'What does HTML stand for?',
      options: [
        'Hyper Text Markup Language',
        'High Tech Modern Language',
        'Hyper Transfer Markup Language',
        'Hyper Text Machine Language'
      ],
      answer: 0
    },
    {
      type: 'single',
      question: 'Which CSS property changes text color?',
      options: ['color', 'font-color', 'text-color', 'background-color'],
      answer: 0
    },
    {
      type: 'multi',
      question: 'Which are JavaScript frameworks?',
      options: ['React', 'Angular', 'Vue', 'Django'],
      answer: [0, 1, 2]
    },
    {
      type: 'fill',
      question: 'The CSS property to make text bold is font-_____.',
      options: [],
      answer: 'weight'
    },
    {
      type: 'single',
      question: 'What is the correct HTML tag for a hyperlink?',
      options: ['<a>', '<link>', '<href>', '<url>'],
      answer: 0
    }
  ]
};
