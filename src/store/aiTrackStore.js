import { create } from 'zustand';
import { loadMemories, saveMemory, MEMORY_TYPES } from '../lib/globalMemory'

const AI_TRACK_DATA = {
  startDate: '2026-05-17',
  totalMonths: 14,
  clusters: [
    {
      id: 'A',
      name: 'Foundation',
      tagline: 'The non-negotiables. 2hrs every morning.',
      color: '#C0392B',
      bg: '#FEF2F2',
      sections: [
        {
          id: 'A1',
          name: 'Python',
          duration: '3 weeks',
          campusx_playlist: 'CampusX Python for AI Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [
            {
              title: 'Python Crash Course',
              author: 'Eric Matthes',
              why: 'Fastest path to Python fluency. Practical, project-based, no fluff.',
              difficulty: 'Accessible',
              free: false
            },
            {
              title: 'Fluent Python',
              author: 'Luciano Ramalho',
              why: 'Deep Python internals. Read chapters 1-8 for AI work.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'A1-1', title: 'Python Core Fundamentals', desc: 'Syntax, variables, control flow, functions, lambdas, comprehensions' },
            { id: 'A1-2', title: 'Built-in Data Structures', desc: 'Lists, tuples, sets, dicts, strings — master all operations' },
            { id: 'A1-3', title: 'Pythonic Thinking', desc: 'Iterators, generators, zip, enumerate, map, filter, *args, **kwargs' },
            { id: 'A1-4', title: 'OOP in Python', desc: 'Classes, inheritance, dunder methods, dataclasses, polymorphism' },
            { id: 'A1-5', title: 'Error Handling & Modules', desc: 'try/except, custom exceptions, venv, pip, imports' },
            { id: 'A1-6', title: 'File Handling & Serialization', desc: 'CSV, JSON, Pickle, os, pathlib, logging' },
            { id: 'A1-7', title: 'NumPy', desc: 'Arrays, shapes, broadcasting, vectorized ops, linear algebra basics' },
            { id: 'A1-8', title: 'Pandas', desc: 'Series, DataFrames, indexing, groupby, missing values, merging' },
            { id: 'A1-9', title: 'Data Visualization', desc: 'Matplotlib, Seaborn, EDA plot types' },
            { id: 'A1-10', title: 'Async & Production Python', desc: 'async/await, multithreading, FastAPI, Pydantic, clean code' }
          ]
        },
        {
          id: 'A2',
          name: 'SQL',
          duration: '2 weeks',
          campusx_playlist: 'CampusX SQL for AI Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [
            {
              title: 'Learning SQL',
              author: 'Alan Beaulieu',
              why: 'Best SQL book for programmers. Covers everything from basics to window functions.',
              difficulty: 'Accessible',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'A2-1', title: 'SQL Fundamentals & Schema', desc: 'Tables, constraints, normalization, indexes' },
            { id: 'A2-2', title: 'Core Querying', desc: 'SELECT, WHERE, ORDER BY, LIMIT, joins, subqueries, CTEs' },
            { id: 'A2-3', title: 'Aggregations & Window Functions', desc: 'GROUP BY, HAVING, ROW_NUMBER, RANK, LAG, LEAD, running totals' },
            { id: 'A2-4', title: 'Data Cleaning & Optimization', desc: 'String/date functions, CAST, NULL handling, EXPLAIN, indexes' },
            { id: 'A2-5', title: 'SQL + Python Integration', desc: 'sqlite3, psycopg2, SQLAlchemy, parameterized queries' }
          ]
        },
        {
          id: 'A3',
          name: 'Mathematics',
          duration: '3 weeks',
          campusx_playlist: 'CampusX Maths for AI Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [
            {
              title: 'Mathematics for Machine Learning',
              author: 'Deisenroth, Faisal, Ong',
              why: 'Free PDF. The standard reference. Covers everything you need — linear algebra, calculus, probability.',
              difficulty: 'Intermediate',
              free: true,
              url: 'https://mml-book.github.io'
            },
            {
              title: 'Statistics in Plain English',
              author: 'Timothy Urdan',
              why: 'Best stats book for non-mathematicians. Intuitive without being dumbed down.',
              difficulty: 'Accessible',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'A3-1', title: 'Linear Algebra', desc: 'Vectors, matrices, dot product, transpose, inverse, eigenvalues, SVD, norms' },
            { id: 'A3-2', title: 'Calculus & Optimization', desc: 'Derivatives, gradients, chain rule, gradient descent, loss functions' },
            { id: 'A3-3', title: 'Probability Theory', desc: 'PMF, PDF, CDF, distributions, Bayes theorem, likelihood' },
            { id: 'A3-4', title: 'Statistics', desc: 'Central tendency, dispersion, CLT, bias-variance, sampling' },
            { id: 'A3-5', title: 'Information Theory & Matrix Decomposition', desc: 'Entropy, cross-entropy, KL divergence, SVD, PCA math' }
          ]
        },
        {
          id: 'A4',
          name: 'Software Essentials + Cloud',
          duration: '2 weeks',
          campusx_playlist: 'Git & GitHub by CampusX',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: { name: 'Docker for Machine Learning', price: 399, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'The Missing README',
              author: 'Chris Riccomini, Dmitriy Ryaboy',
              why: 'What they dont teach in CS. Git, code review, APIs, working in teams — practical engineering skills.',
              difficulty: 'Accessible',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'A4-1', title: 'Git & GitHub', desc: 'Branching, merging, PRs, code review, GitHub workflows' },
            { id: 'A4-2', title: 'APIs & REST', desc: 'HTTP methods, JSON, authentication, rate limiting, error handling' },
            { id: 'A4-3', title: 'Cloud Fundamentals', desc: 'IaaS/PaaS/SaaS, IAM, compute, storage, networking, Docker basics' },
            { id: 'A4-4', title: 'AI Coding Tools', desc: 'Prompting for code, validating AI output, Claude Code, agentic coding' }
          ]
        },
        {
          id: 'A5',
          name: 'DSA for AI',
          duration: '12 months (parallel)',
          campusx_playlist: 'CampusX DSA for AI',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: { name: 'DSA for AI — CampusX', price: 2499, url: 'https://learnwith.campusx.in' },
          books: [],
          papers: [],
          note: 'Run parallel with everything. 1 hour daily. Target 474+ Striver A2Z problems. Tracked separately in SDE Roadmap.',
          topics: [
            { id: 'A5-1', title: 'Arrays, Strings, Hashmaps', desc: 'Most interview questions come from here' },
            { id: 'A5-2', title: 'Trees & Binary Search', desc: 'Core data structures' },
            { id: 'A5-3', title: 'Two Pointers & Sliding Window', desc: 'Pattern recognition problems' },
            { id: 'A5-4', title: 'Graphs — BFS/DFS', desc: 'Used in agent traversal problems' },
            { id: 'A5-5', title: 'Dynamic Programming Basics', desc: 'Essential for hard problems' }
          ]
        }
      ]
    },
    {
      id: 'B',
      name: 'Machine Learning',
      tagline: 'Every concept must produce a working model.',
      color: '#E07B39',
      bg: '#FFF0E6',
      sections: [
        {
          id: 'B1',
          name: 'ML Fundamentals',
          duration: '2 weeks',
          campusx_playlist: '100 Days of ML — Videos 1-22',
          campusx_url: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH',
          paid_course: { name: '100 Days of ML Notes', price: 499, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'The Hundred-Page Machine Learning Book',
              author: 'Andriy Burkov',
              why: 'Free PDF on request. Best single-book ML overview. Dense with insight, not padding.',
              difficulty: 'Intermediate',
              free: true,
              url: 'http://themlbook.com'
            },
            {
              title: 'Hands-On ML with Scikit-Learn, Keras & TensorFlow',
              author: 'Aurélien Géron',
              why: 'The practical bible. Read alongside 100 Days of ML. Every chapter has working code.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [
            {
              title: 'A Few Useful Things to Know About Machine Learning',
              authors: 'Pedro Domingos',
              year: '2012',
              why: '10 pages. Best intro to ML thinking ever written. Read before anything else in Cluster B.',
              url: 'https://homes.cs.washington.edu/~pedrod/papers/cacm12.pdf'
            }
          ],
          topics: [
            { id: 'B1-1', title: 'What ML Really Is', desc: 'ML vs traditional programming, when to use ML, types of learning' },
            { id: 'B1-2', title: 'ML Problem Formulation', desc: 'Regression vs classification, clustering, anomaly detection, ranking' },
            { id: 'B1-3', title: 'Train/Val/Test Split & Data Leakage', desc: 'Cross-validation, hold-out, why leakage destroys models' },
            { id: 'B1-4', title: 'Loss Functions & Evaluation Metrics', desc: 'MAE, MSE, log loss, precision, recall, F1, confusion matrix' },
            { id: 'B1-5', title: 'Bias-Variance Tradeoff', desc: 'Underfitting vs overfitting, model complexity, why it never disappears' },
            { id: 'B1-6', title: 'End-to-End ML Workflow', desc: 'Problem → data → train → validate → deploy awareness' }
          ]
        },
        {
          id: 'B2',
          name: 'Feature Engineering',
          duration: '2 weeks',
          campusx_playlist: '100 Days of ML — Videos 23-45',
          campusx_url: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH',
          paid_course: { name: '100 Days of ML Notes', price: 499, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'Feature Engineering for Machine Learning',
              author: 'Alice Zheng, Amanda Casari',
              why: 'The dedicated book on this topic. Real techniques from real practitioners.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'B2-1', title: 'Feature Types & Data Understanding', desc: 'Numerical, categorical, ordinal, text, datetime, cardinality' },
            { id: 'B2-2', title: 'Missing Values & Encoding', desc: 'Imputation strategies, label encoding, one-hot, ordinal, high-cardinality' },
            { id: 'B2-3', title: 'Scaling & Outliers', desc: 'Standardization, min-max, robust scaling, outlier detection and handling' },
            { id: 'B2-4', title: 'Feature Transformation & Creation', desc: 'Log transforms, ratios, aggregations, interaction features, binning' },
            { id: 'B2-5', title: 'Temporal & Text Features', desc: 'Lag features, rolling windows, BoW, TF-IDF intro, leakage risks' },
            { id: 'B2-6', title: 'Feature Selection & Pipelines', desc: 'Correlation filtering, variance threshold, fit vs transform, reproducibility' }
          ]
        },
        {
          id: 'B3',
          name: 'ML Algorithms',
          duration: '4 weeks',
          campusx_playlist: '100 Days of ML — Videos 45-130',
          campusx_url: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH',
          paid_course: { name: '100 Days of ML Notes', price: 499, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'Hands-On ML with Scikit-Learn, Keras & TensorFlow',
              author: 'Aurélien Géron',
              why: 'The go-to reference for every algorithm. Chapters 1-9 cover all classical ML.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [
            {
              title: 'XGBoost: A Scalable Tree Boosting System',
              authors: 'Chen & Guestrin',
              year: '2016',
              why: 'Understand why this dominated Kaggle for 5 years. Beautiful maths behind gradient boosting.',
              url: 'https://arxiv.org/abs/1603.02754'
            }
          ],
          topics: [
            { id: 'B3-1', title: 'Linear Models', desc: 'Linear Regression, Ridge, Lasso, Elastic Net, Logistic Regression' },
            { id: 'B3-2', title: 'Distance & Probability Models', desc: 'kNN, Naive Bayes (Gaussian, Multinomial, Bernoulli)' },
            { id: 'B3-3', title: 'Tree-Based Models', desc: 'Decision Tree (classification + regression), feature importance' },
            { id: 'B3-4', title: 'Ensemble Methods', desc: 'Random Forest, Extra Trees, AdaBoost, Gradient Boosting' },
            { id: 'B3-5', title: 'Boosting Libraries', desc: 'XGBoost, LightGBM, CatBoost — hyperparameters and production use' },
            { id: 'B3-6', title: 'SVMs', desc: 'SVC, SVR, kernel trick, margin concept' },
            { id: 'B3-7', title: 'Unsupervised Learning', desc: 'K-Means, Hierarchical, DBSCAN, GMM' },
            { id: 'B3-8', title: 'Dimensionality Reduction', desc: 'PCA, Kernel PCA, LDA, t-SNE, SVD' },
            { id: 'B3-9', title: 'Anomaly Detection', desc: 'Isolation Forest, One-Class SVM, LOF' },
            { id: 'B3-10', title: 'Recommendation & Ranking', desc: 'Matrix Factorization, SVD for recommendations' }
          ]
        },
        {
          id: 'B4',
          name: 'ML Advanced Concepts',
          duration: '2 weeks',
          campusx_playlist: '100 Days of ML — Final Videos',
          campusx_url: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH',
          paid_course: { name: 'Explainable AI (XAI)', price: 699, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'Interpretable Machine Learning',
              author: 'Christoph Molnar',
              why: 'Free online. The definitive book on SHAP, LIME, and explainability. Essential for production ML.',
              difficulty: 'Intermediate',
              free: true,
              url: 'https://christophm.github.io/interpretable-ml-book'
            }
          ],
          papers: [],
          topics: [
            { id: 'B4-1', title: 'Hyperparameter Optimization', desc: 'Grid search, random search, Bayesian optimization' },
            { id: 'B4-2', title: 'Validation Strategies', desc: 'Stratified, time-series, nested cross-validation' },
            { id: 'B4-3', title: 'Imbalanced Data', desc: 'SMOTE, class weighting, threshold moving, oversampling/undersampling' },
            { id: 'B4-4', title: 'Ensemble Theory', desc: 'Bagging vs boosting, stacking, blending, voting classifiers' },
            { id: 'B4-5', title: 'Interpretability', desc: 'SHAP, LIME, feature importance, partial dependence plots' }
          ]
        },
        {
          id: 'B5',
          name: 'NLP (Traditional)',
          duration: '1.5 weeks',
          campusx_playlist: 'CampusX NLP Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [],
          papers: [],
          topics: [
            { id: 'B5-1', title: 'Text Preprocessing', desc: 'Normalization, tokenization, stemming, lemmatization, stopwords' },
            { id: 'B5-2', title: 'Text Representation', desc: 'BoW, N-grams, TF-IDF, sparse vs dense, vocabulary creation' },
            { id: 'B5-3', title: 'Traditional NLP Models', desc: 'Naive Bayes, Logistic Regression, SVM for text' },
            { id: 'B5-4', title: 'NLP Pipeline', desc: 'Data → features → model → evaluation, handling OOV words, leakage' }
          ]
        },
        {
          id: 'B6',
          name: 'Computer Vision (Classical)',
          duration: '1.5 weeks',
          campusx_playlist: 'CampusX Image Processing Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [],
          papers: [],
          topics: [
            { id: 'B6-1', title: 'Image Basics', desc: 'Reading, grayscale/color conversion, resizing, normalization, thresholding' },
            { id: 'B6-2', title: 'Feature Detection', desc: 'Edge detection (Sobel, Canny), corner detection (Harris, FAST)' },
            { id: 'B6-3', title: 'Feature Descriptors & Transforms', desc: 'SIFT, SURF, ORB, geometric transforms, morphological ops' },
            { id: 'B6-4', title: 'CV Pipeline', desc: 'Acquisition → preprocessing → features → model → evaluation' }
          ]
        },
        {
          id: 'B7',
          name: 'Deep Learning',
          duration: '6 weeks',
          campusx_playlist: '100 Days of Deep Learning — CampusX',
          campusx_url: 'https://youtube.com/@campusx-official/playlists',
          paid_course: null,
          books: [
            {
              title: 'Deep Learning',
              author: 'Goodfellow, Bengio, Courville',
              why: 'Free PDF. The bible of deep learning. Dense but authoritative. Use as reference, not cover-to-cover.',
              difficulty: 'Dense',
              free: true,
              url: 'https://www.deeplearningbook.org'
            },
            {
              title: 'Dive into Deep Learning',
              author: 'd2l.ai — Zhang et al.',
              why: 'Free, interactive, runs in browser. Best practical DL book. Every concept has runnable code.',
              difficulty: 'Intermediate',
              free: true,
              url: 'https://d2l.ai'
            }
          ],
          papers: [
            {
              title: 'Attention Is All You Need',
              authors: 'Vaswani et al.',
              year: '2017',
              why: 'Invented the Transformer. Every LLM today is built on this 12-page paper. Read it slowly, twice.',
              url: 'https://arxiv.org/abs/1706.03762'
            },
            {
              title: 'ImageNet Classification with Deep CNNs (AlexNet)',
              authors: 'Krizhevsky, Sutskever, Hinton',
              year: '2012',
              why: 'Started the deep learning revolution. Understand why depth + GPUs changed everything.',
              url: 'https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html'
            },
            {
              title: 'Deep Residual Learning for Image Recognition (ResNet)',
              authors: 'He et al.',
              year: '2016',
              why: 'Solved the vanishing gradient problem. Residual connections are everywhere in modern architectures.',
              url: 'https://arxiv.org/abs/1512.03385'
            }
          ],
          topics: [
            { id: 'B7-1', title: 'Foundations of Neural Networks', desc: 'Neurons, layers, forward pass, activations, loss, backprop, gradient flow' },
            { id: 'B7-2', title: 'Optimization & Regularization', desc: 'Adam, AdamW, learning rate schedules, batch norm, dropout, L1/L2' },
            { id: 'B7-3', title: 'CNN & Transfer Learning', desc: 'Convolution, pooling, ResNet, MobileNet, pretrained backbones, fine-tuning' },
            { id: 'B7-4', title: 'Vision Transformers', desc: 'ViT, patch embedding, CLS token, ViT vs CNN tradeoffs' },
            { id: 'B7-5', title: 'Sequence Models', desc: 'RNN, LSTM, GRU, Bidirectional RNN, deep RNNs' },
            { id: 'B7-6', title: 'Seq2Seq & Attention', desc: 'Encoder-decoder, context bottleneck, Bahdanau, Luong attention' },
            { id: 'B7-7', title: 'Transformer Architecture', desc: 'Self-attention, multi-head, positional encoding, FFN, LayerNorm, causal mask' },
            { id: 'B7-8', title: 'Unsupervised Deep Learning', desc: 'Autoencoders, VAE, GANs, DCGAN, CycleGAN, StyleGAN' }
          ]
        },
        {
          id: 'B8',
          name: 'End-to-End Projects',
          duration: '4 weeks',
          campusx_playlist: 'CampusX ML Projects Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [
            {
              title: 'Designing Machine Learning Systems',
              author: 'Chip Huyen',
              why: 'How to build ML systems that actually work in production. Essential before applying for ML jobs.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'B8-1', title: 'House Price Prediction', desc: 'Regression classic — feature engineering heavy' },
            { id: 'B8-2', title: 'Customer Churn Prediction', desc: 'Classification classic — business metric focus' },
            { id: 'B8-3', title: 'Credit Card Fraud Detection', desc: 'Imbalanced data problem — SMOTE, threshold tuning' },
            { id: 'B8-4', title: 'Movie Recommendation System', desc: 'Collaborative filtering, matrix factorization' },
            { id: 'B8-5', title: 'Sentiment Analysis System', desc: 'NLP pipeline end-to-end' },
            { id: 'B8-6', title: 'Customer Segmentation', desc: 'Unsupervised — K-means, PCA' },
            { id: 'B8-7', title: 'Image Classifier', desc: 'CNN with transfer learning — practical DL' },
            { id: 'B8-8', title: 'Disease Risk Prediction', desc: 'Healthcare — real-world feature importance' }
          ]
        }
      ]
    },
    {
      id: 'C',
      name: 'LLM / AI Engineer',
      tagline: 'This is where jobs are in 2026. Start Week 1.',
      color: '#1A6B4A',
      bg: '#F0FDF4',
      sections: [
        {
          id: 'C1',
          name: 'LLM 101',
          duration: '2 weeks',
          campusx_playlist: 'CampusX GenAI Introduction Videos',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [
            {
              title: 'Build a Large Language Model from Scratch',
              author: 'Sebastian Raschka',
              why: 'Build GPT from scratch in PyTorch. Best way to understand LLMs deeply. Modern, practical, 2024.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [
            {
              title: 'Scaling Laws for Neural Language Models',
              authors: 'Kaplan et al.',
              year: '2020',
              why: 'Why bigger models keep getting smarter. The math of intelligence scaling. Short and mind-bending.',
              url: 'https://arxiv.org/abs/2001.08361'
            },
            {
              title: 'Training language models to follow instructions (InstructGPT)',
              authors: 'Ouyang et al.',
              year: '2022',
              why: 'How RLHF made GPT safe and helpful. What was sacrificed. Crucial for understanding alignment.',
              url: 'https://arxiv.org/abs/2203.02155'
            }
          ],
          topics: [
            { id: 'C1-1', title: 'What LLMs Actually Are', desc: 'Next-token prediction, emergence, foundation vs task-specific models' },
            { id: 'C1-2', title: 'Transformer Architecture (LLM lens)', desc: 'Decoder-only dominance, context window, KV cache, positional encoding' },
            { id: 'C1-3', title: 'Tokenization & Embeddings', desc: 'BPE, WordPiece, tokens vs words, cost implications, semantic similarity' },
            { id: 'C1-4', title: 'Training Paradigm', desc: 'Pretraining, fine-tuning, instruction tuning, RLHF, why models hallucinate' },
            { id: 'C1-5', title: 'Inference Mechanics', desc: 'Temperature, top-k, top-p, beam search, log probs, token streaming' },
            { id: 'C1-6', title: 'Model Ecosystem', desc: 'Proprietary vs open-weight, quantization, MoE, multimodal, reasoning models' },
            { id: 'C1-7', title: 'Evaluation & Failure Modes', desc: 'MMLU, GSM8K, HumanEval, hallucination types, prompt injection, data contamination' }
          ]
        },
        {
          id: 'C2',
          name: 'Prompt Engineering',
          duration: '1 week',
          campusx_playlist: 'CampusX GenAI Introduction Videos',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [],
          papers: [
            {
              title: 'Chain-of-Thought Prompting Elicits Reasoning in LLMs',
              authors: 'Wei et al.',
              year: '2022',
              why: 'Why step-by-step prompting dramatically improves model performance. The paper behind CoT.',
              url: 'https://arxiv.org/abs/2201.11903'
            }
          ],
          topics: [
            { id: 'C2-1', title: 'Mental Model of Prompting', desc: 'LLM as probability machine, distribution steering, why prompts fail' },
            { id: 'C2-2', title: 'Prompt Structure & Patterns', desc: 'System/user/assistant messages, zero-shot, few-shot, CoT, self-consistency' },
            { id: 'C2-3', title: 'Structured Output Prompting', desc: 'JSON output, Pydantic schemas, function calling, deterministic format enforcement' },
            { id: 'C2-4', title: 'Prompt Robustness & Security', desc: 'Sensitivity testing, adversarial prompting, injection risks, guardrails, versioning' }
          ]
        },
        {
          id: 'C3',
          name: 'RAG',
          duration: '2 weeks',
          campusx_playlist: 'CampusX RAG Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: { name: 'Advanced RAG', price: 1999, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'AI Engineering',
              author: 'Chip Huyen',
              why: 'The definitive 2025 book on building production AI systems. RAG, evaluation, deployment — all covered.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [
            {
              title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP',
              authors: 'Lewis et al.',
              year: '2020',
              why: 'The original RAG paper. Read before building any RAG system. Understand what it was designed to solve.',
              url: 'https://arxiv.org/abs/2005.11401'
            }
          ],
          topics: [
            { id: 'C3-1', title: 'RAG Fundamentals', desc: 'Parametric vs non-parametric memory, when RAG vs fine-tuning, core pipeline' },
            { id: 'C3-2', title: 'Data Preparation & Indexing', desc: 'Document ingestion, chunking strategies, overlap, metadata, embedding generation' },
            { id: 'C3-3', title: 'Retrieval Strategies', desc: 'Similarity search, hybrid search (BM25 + vectors), re-ranking, multi-query' },
            { id: 'C3-4', title: 'Context Construction', desc: 'Ordering chunks, removing redundancy, source attribution, context overflow' },
            { id: 'C3-5', title: 'Advanced RAG Patterns', desc: 'Iterative, self-RAG, corrective RAG, graph RAG, agentic RAG' },
            { id: 'C3-6', title: 'Vector Databases', desc: 'ChromaDB, Pinecone, pgvector, Weaviate, Milvus — practical comparison' },
            { id: 'C3-7', title: 'RAG Evaluation & Failure Modes', desc: 'Faithfulness, groundedness, poor chunking, irrelevant retrieval, stale data' }
          ]
        },
        {
          id: 'C4',
          name: 'Memory in AI Systems',
          duration: '1 week',
          campusx_playlist: 'LLM Memory Playlist — CampusX',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: null,
          books: [],
          papers: [],
          topics: [
            { id: 'C4-1', title: 'Memory Types & Storage', desc: 'Short-term, long-term, working memory, in-memory, file, DB, vector storage' },
            { id: 'C4-2', title: 'Memory Retrieval & Compression', desc: 'Recency, similarity, importance-based, summarization, deduplication, aging' },
            { id: 'C4-3', title: 'Agentic Memory', desc: 'State persistence, checkpointing, multi-agent shared memory, Mem0, LangGraph checkpointers' }
          ]
        },
        {
          id: 'C5',
          name: 'Generative AI using LangChain',
          duration: '2 weeks',
          campusx_playlist: 'Generative AI using LangChain — CampusX YouTube',
          campusx_url: 'https://youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0',
          paid_course: { name: 'GenAI using LangChain Notes', price: 399, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'AI Engineering',
              author: 'Chip Huyen',
              why: 'Covers LangChain patterns and production AI architecture in depth.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'C5-1', title: 'LangChain Architecture', desc: 'Chains, runnables, retrievers, vector stores, prompt templates, output parsers' },
            { id: 'C5-2', title: 'RAG Chatbot Build', desc: 'End-to-end RAG chatbot — document loading → chunking → retrieval → generation' },
            { id: 'C5-3', title: 'Tool Calling & LangChain Agents', desc: 'Function calling, agent executor, tool selection, result interpretation' },
            { id: 'C5-4', title: 'Deployment', desc: 'FastAPI + LangChain, Docker, cloud deployment of LangChain apps' }
          ]
        },
        {
          id: 'C6',
          name: 'Fine-Tuning',
          duration: '2 weeks',
          campusx_playlist: null,
          campusx_url: null,
          paid_course: { name: 'GenAI using Open Source LLMs', price: 599, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'The LLM Engineers Handbook',
              author: 'Paul Iusztin, Maxime Labonne',
              why: 'Most practical book on fine-tuning and LLM engineering. Covers LoRA, QLoRA, and production deployment.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [
            {
              title: 'LoRA: Low-Rank Adaptation of Large Language Models',
              authors: 'Hu et al.',
              year: '2021',
              why: 'Fine-tunes 70B models by updating 0.1% of parameters. The maths is elegant. Essential paper.',
              url: 'https://arxiv.org/abs/2106.09685'
            }
          ],
          topics: [
            { id: 'C6-1', title: 'Fine-Tuning Fundamentals', desc: 'SFT, instruction-response format, pretraining vs fine-tuning, alignment' },
            { id: 'C6-2', title: 'RLHF & DPO', desc: 'Reward modeling, RLHF intuition, Direct Preference Optimization overview' },
            { id: 'C6-3', title: 'LoRA & QLoRA', desc: 'Low-rank decomposition, attention injection, 4-bit quantization, memory efficiency' },
            { id: 'C6-4', title: 'Data Preparation & Evaluation', desc: 'Instruction datasets, deduplication, synthetic data, catastrophic forgetting' },
            { id: 'C6-5', title: 'Adapter Management & Deployment', desc: 'Versioning, swapping adapters, quantized inference, monitoring drift' }
          ]
        },
        {
          id: 'C7',
          name: 'Agentic AI',
          duration: '3 weeks',
          campusx_playlist: 'CampusX LangGraph Playlist',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: { name: 'Agentic AI using LangGraph Notes', price: 399, url: 'https://learnwith.campusx.in' },
          books: [],
          papers: [
            {
              title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
              authors: 'Yao et al.',
              year: '2022',
              why: 'Foundation of every AI agent ever built. Short paper, enormous impact. The Think→Act→Observe loop.',
              url: 'https://arxiv.org/abs/2210.03629'
            },
            {
              title: 'AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation',
              authors: 'Wu et al.',
              year: '2023',
              why: 'Multi-agent systems design. Understanding how agents communicate and coordinate.',
              url: 'https://arxiv.org/abs/2308.08155'
            }
          ],
          topics: [
            { id: 'C7-1', title: 'Planning & Reasoning Patterns', desc: 'CoT, Tree-of-Thoughts, ReAct, planner-executor, hierarchical planning' },
            { id: 'C7-2', title: 'Task Decomposition & Iterative Loops', desc: 'Subtask generation, dependency mapping, Think→Act→Observe, replanning' },
            { id: 'C7-3', title: 'MCP & Agent Protocols', desc: 'Model Context Protocol, tool schemas, client-server architecture, A2A' },
            { id: 'C7-4', title: 'Agentic Frameworks', desc: 'LangGraph, CrewAI, AutoGen, LlamaIndex Agents, OpenAI Agents SDK, Agno' },
            { id: 'C7-5', title: 'Agent Failure Modes & Safety', desc: 'Infinite loops, hallucinated tools, budget constraints, sandboxing, safety constraints' }
          ]
        },
        {
          id: 'C8',
          name: 'AI Automation',
          duration: '1 week',
          campusx_playlist: 'CampusX N8N Crash Course',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: { name: 'AI Agents & Automation using N8N', price: 499, url: 'https://learnwith.campusx.in' },
          books: [],
          papers: [],
          topics: [
            { id: 'C8-1', title: 'Automation Design Patterns', desc: 'Trigger-based, sequential, conditional, loop/retry patterns' },
            { id: 'C8-2', title: 'Tool Integration', desc: 'APIs, function calling, DB, file, email, web scraping, SaaS integration' },
            { id: 'C8-3', title: 'Workflow Orchestration', desc: 'n8n, Zapier, Make — hands-on automation builds' }
          ]
        },
        {
          id: 'C9',
          name: 'LLMOps',
          duration: '2 weeks',
          campusx_playlist: 'CampusX MLOps Videos',
          campusx_url: 'https://youtube.com/@campusx-official',
          paid_course: { name: 'Docker for Machine Learning', price: 399, url: 'https://learnwith.campusx.in' },
          books: [
            {
              title: 'Designing Machine Learning Systems',
              author: 'Chip Huyen',
              why: 'Production ML and LLM systems. Deployment, monitoring, retraining — real engineering.',
              difficulty: 'Intermediate',
              free: false
            }
          ],
          papers: [],
          topics: [
            { id: 'C9-1', title: 'Deployment', desc: 'FastAPI, Docker, cloud (AWS/GCP/Azure), CI/CD for ML' },
            { id: 'C9-2', title: 'Observability & Safety', desc: 'Logging, tracing, LangSmith, OpenTelemetry, guardrails, content filtering' },
            { id: 'C9-3', title: 'Governance & Managed Platforms', desc: 'Policies, audit trails, compliance, managed AI platform awareness' },
            { id: 'C9-4', title: 'MLOps for DL', desc: 'Distributed training, checkpointing, large model storage, optimized inference' }
          ]
        }
      ]
    }
  ],

  phases: [
    {
      number: 1,
      name: 'Intense Sprint',
      duration: 'May 17 – Jul 17 (2 months)',
      focus: 'Python → NumPy → Pandas → SQL + ML Fundamentals (1-60) + LLM literacy',
      hoursPerDay: 4,
      color: '#C0392B'
    },
    {
      number: 2,
      name: 'Deep Learning Enters',
      duration: 'Aug – Sep (2 months)',
      focus: 'Complete Maths + 100 Days of ML + 100 Days of DL + Prompt Engineering',
      hoursPerDay: 4,
      color: '#E07B39'
    },
    {
      number: 3,
      name: 'AI Engineer Full Throttle',
      duration: 'Oct – Dec (3 months)',
      focus: 'LangChain full + RAG pipeline + Vector DBs + NLP + CV classical',
      hoursPerDay: 4,
      color: '#1A6B4A'
    },
    {
      number: 4,
      name: 'Agents + MLOps',
      duration: 'Jan – Mar (3 months)',
      focus: 'Agentic AI (LangGraph) + Fine-tuning (LoRA/QLoRA) + Docker + LLMOps',
      hoursPerDay: 4,
      color: '#7C3AED'
    },
    {
      number: 5,
      name: 'Placement Mode',
      duration: 'Apr – Jul (4 months)',
      focus: 'Polish projects + ML System Design + Apply aggressively',
      hoursPerDay: 6,
      color: '#1A1A2E'
    }
  ],

  placement: {
    salaryTarget: '15-30 LPA',
    targetRoles: ['AI Engineer', 'GenAI Engineer', 'ML Engineer', 'Agentic AI Developer'],
    targetCompanies: [
      { name: 'Flipkart', type: 'Product', priority: 'High', salary: '20-30 LPA' },
      { name: 'Razorpay', type: 'Fintech', priority: 'High', salary: '18-28 LPA' },
      { name: 'PhonePe', type: 'Fintech', priority: 'High', salary: '18-25 LPA' },
      { name: 'CRED', type: 'Fintech', priority: 'High', salary: '20-30 LPA' },
      { name: 'Meesho', type: 'E-commerce', priority: 'Medium', salary: '15-22 LPA' },
      { name: 'Zomato', type: 'Consumer Tech', priority: 'Medium', salary: '15-25 LPA' },
      { name: 'Microsoft GCC', type: 'MNC', priority: 'High', salary: '20-35 LPA' },
      { name: 'Google GCC', type: 'MNC', priority: 'High', salary: '25-40 LPA' },
      { name: 'Amazon', type: 'MNC', priority: 'High', salary: '20-35 LPA' },
      { name: 'Swiggy', type: 'Consumer Tech', priority: 'Medium', salary: '15-22 LPA' },
      { name: 'Groww', type: 'Fintech', priority: 'Medium', salary: '15-22 LPA' },
      { name: 'Zepto', type: 'Quick Commerce', priority: 'Medium', salary: '15-20 LPA' },
      { name: 'Ola', type: 'Mobility Tech', priority: 'Low', salary: '12-20 LPA' },
      { name: 'Paytm', type: 'Fintech', priority: 'Low', salary: '12-18 LPA' },
      { name: 'Startups (YC/Sequoia backed)', type: 'Startup', priority: 'High', salary: '15-25 LPA' }
    ],
    jobHuntingPlan: [
      { week: '1-2', action: 'Polish all 4 GitHub projects with proper READMEs and demos' },
      { week: '3-4', action: 'LinkedIn optimization + reach out to 20 AI engineers for referrals' },
      { week: '5-6', action: 'Apply to 50+ companies via LinkedIn, company portals, referrals' },
      { week: '7-8', action: 'Interview prep — ML System Design rounds + coding rounds' }
    ]
  }
};

export const useAiTrackStore = create((set, get) => ({
  progress: {},
  difficultyRatings: {},
  explorerSessions: {},
  isLoadingProgress: false,
  isGeneratingExploration: false,
  activeExploration: null,
  completedClusters: {},
  clusterCompletionLoaded: false,
  topicMinutes: {},
  timeLoaded: false,

  loadProgress: async () => {
    set({ isLoadingProgress: true });
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('ai_track_progress')
        .select('*');
      
      const progressMap = {};
      const ratings = {};
      data?.forEach(row => {
        progressMap[row.topic_id] = {
          phase1_done: row.phase1_done,
          phase2_done: row.phase2_done,
          phase1_date: row.phase1_date,
          phase2_date: row.phase2_date,
          notes: row.notes
        };
        if (row.difficulty_rating !== null && row.difficulty_rating !== undefined) {
          ratings[row.topic_id] = row.difficulty_rating;
        }
      });
      set({ 
        progress: progressMap, 
        difficultyRatings: ratings,
        isLoadingProgress: false 
      });
    } catch (err) {
      console.error('loadProgress error:', err);
      set({ isLoadingProgress: false });
    }
  },

  loadCompletedClusters: async () => {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase
      .from('ai_sessions')
      .select('context_snapshot, session_date')
      .eq('type', 'cluster_completion')
    
    const completed = {}
    ;(data || []).forEach(row => {
      try {
        const ctx = JSON.parse(row.context_snapshot)
        if (ctx.clusterId) {
          completed[ctx.clusterId] = {
            completedAt: row.session_date,
            topicsCompleted: ctx.topicsCompleted
          }
        }
      } catch {}
    })
    set({ completedClusters: completed, clusterCompletionLoaded: true })
  },

  loadTopicTime: async () => {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase
      .from('ai_track_progress')
      .select('topic_id, minutes_logged')
      .not('minutes_logged', 'is', null)

    const minutesMap = {}
    ;(data || []).forEach(row => {
      if (row.minutes_logged) {
        minutesMap[row.topic_id] = row.minutes_logged
      }
    })
    set({ topicMinutes: minutesMap, timeLoaded: true })
  },

  logTopicTime: async (topicId, topicTitle, sectionId, cluster, minutes) => {
    if (!minutes || minutes <= 0) return
    
    const current = get().topicMinutes[topicId] || 0
    const newTotal = current + minutes
    
    // Optimistic
    set(state => ({
      topicMinutes: { ...state.topicMinutes, [topicId]: newTotal }
    }))

    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('ai_track_progress')
        .upsert({
          topic_id: topicId,
          topic_title: topicTitle,
          section_id: sectionId,
          cluster: cluster,
          minutes_logged: newTotal,
          updated_at: new Date().toISOString()
        }, { onConflict: 'topic_id' })
    } catch (err) {
      console.error('logTopicTime error:', err)
    }
  },

  getSectionMinutes: (sectionId) => {
    const { topicMinutes } = get()
    const cluster = AI_TRACK_DATA.clusters.find(c => 
      c.sections.find(s => s.id === sectionId)
    )
    if (!cluster) return 0
    const section = cluster.sections.find(s => s.id === sectionId)
    if (!section) return 0
    return section.topics.reduce((sum, topic) => 
      sum + (topicMinutes[topic.id] || 0), 0
    )
  },

  getClusterMinutes: (clusterId) => {
    const { topicMinutes } = get()
    const cluster = AI_TRACK_DATA.clusters.find(c => c.id === clusterId)
    if (!cluster) return 0
    return cluster.sections.flatMap(s => s.topics)
      .reduce((sum, topic) => 
        sum + (topicMinutes[topic.id] || 0), 0
      )
  },

  getSlowestTopics: () => {
    const { topicMinutes } = get()
    return Object.entries(topicMinutes)
      .filter(([, mins]) => mins > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topicId, minutes]) => {
        let topicTitle = topicId
        AI_TRACK_DATA.clusters.forEach(c => {
          c.sections.forEach(s => {
            s.topics.forEach(t => {
              if (t.id === topicId) topicTitle = t.title
            })
          })
        })
        return { topicId, topicTitle, minutes }
      })
  },

  checkClusterCompletion: async (clusterId, clusterName) => {
    const { progress, completedClusters } = get()

    // Already celebrated this cluster
    if (completedClusters[clusterId]) return

    // Get all topic IDs for this cluster
    const cluster = AI_TRACK_DATA.clusters.find(c => c.id === clusterId)
    if (!cluster) return

    const allTopicIds = cluster.sections.flatMap(s => 
      s.topics.map(t => t.id)
    )
    const completedCount = allTopicIds.filter(id => 
      progress[id]?.phase2_done
    ).length

    if (completedCount < allTopicIds.length) return

    // All topics done — save milestone
    const { supabase } = await import('../lib/supabase');
    const { getTodayIST } = await import('../lib/dateUtils');
    const today = getTodayIST()
    await supabase.from('ai_sessions').insert({
      type: 'cluster_completion',
      session_date: today,
      user_input: clusterId,
      ai_response: clusterName,
      context_snapshot: JSON.stringify({
        clusterId,
        clusterName,
        topicsCompleted: allTopicIds.length,
        completedAt: new Date().toISOString()
      })
    })

    set(state => ({
      completedClusters: {
        ...state.completedClusters,
        [clusterId]: {
          completedAt: today,
          topicsCompleted: allTopicIds.length
        }
      }
    }))

    // Trigger celebration
    const { triggerClusterCelebration } = await import(
      '../components/ClusterCelebration'
    )
    triggerClusterCelebration(clusterName, allTopicIds.length)
  },

  togglePhase1: async (topicId, topicTitle, sectionId, cluster) => {
    const current = get().progress[topicId] || {};
    const newVal = !current.phase1_done;
    
    set(state => ({
      progress: {
        ...state.progress,
        [topicId]: { ...current, phase1_done: newVal }
      }
    }));

    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('ai_track_progress').upsert({
        topic_id: topicId,
        topic_title: topicTitle,
        section_id: sectionId,
        cluster: cluster,
        section_name: sectionId,
        phase1_done: newVal,
        phase1_date: newVal ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'topic_id' });

      if (error) throw error;
    } catch (err) {
      console.error('togglePhase1 error:', err);
      // Rollback
      set(state => ({
        progress: {
          ...state.progress,
          [topicId]: { ...current, phase1_done: !newVal }
        }
      }));
    }
  },

  togglePhase2: async (topicId, topicTitle, sectionId, cluster) => {
    const current = get().progress[topicId] || {};
    const newVal = !current.phase2_done;
    
    set(state => ({
      progress: {
        ...state.progress,
        [topicId]: { ...current, phase2_done: newVal }
      }
    }));

    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('ai_track_progress').upsert({
        topic_id: topicId,
        topic_title: topicTitle,
        section_id: sectionId,
        cluster: cluster,
        section_name: sectionId,
        phase2_done: newVal,
        phase2_date: newVal ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'topic_id' });

      if (error) throw error;
    } catch (err) {
      console.error('togglePhase2 error:', err);
      // Rollback
      set(state => ({
        progress: {
          ...state.progress,
          [topicId]: { ...current, phase2_done: !newVal }
        }
      }));
    }
  },

  rateTopic: async (topicId, topicTitle, sectionId, cluster, rating) => {
    set(state => ({
      difficultyRatings: { 
        ...state.difficultyRatings, 
        [topicId]: rating 
      }
    }));
    
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('ai_track_progress')
        .upsert({
          topic_id: topicId,
          topic_title: topicTitle,
          section_id: sectionId,
          cluster: cluster,
          difficulty_rating: rating,
          updated_at: new Date().toISOString()
        }, { onConflict: 'topic_id' });
    } catch (err) {
      console.error('rateTopic error:', err);
    }
  },

  getRevisionQueue: () => {
    const { difficultyRatings, progress } = get();
    return Object.entries(difficultyRatings)
      .filter(([topicId, rating]) => 
        rating >= 4 && progress[topicId]?.phase2_done
      )
      .map(([topicId, rating]) => ({ topicId, rating }))
      .sort((a, b) => b.rating - a.rating);
  },

  saveTopicNotes: async (topicId, notes) => {
    set(state => ({
      progress: {
        ...state.progress,
        [topicId]: { ...(state.progress[topicId] || {}), notes }
      }
    }));
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('ai_track_progress')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('topic_id', topicId);
    } catch (err) {
      console.error('saveTopicNotes error:', err);
    }
  },

  generateExploration: async (topic, section) => {
    set({ isGeneratingExploration: true, activeExploration: null });
    try {
      let memoryContext = ''
      try {
        const aiTrackMemory = await loadMemories(MEMORY_TYPES.AI_TRACK, 5)
        memoryContext = aiTrackMemory.map(m => m.content).join('\n- ')
      } catch (memErr) {
        console.error('Failed to load ai track memory:', memErr)
      }

      const prompt = `You are an intellectual guide for Abhishek — a 20-year-old Indian engineering student becoming an AI Engineer. He is about to start Week 1 self-exploration of this topic before formal study in Week 2.

Topic: ${topic.title}
Section: ${section.name}
Description: ${topic.desc}

His context: CSE student, trader (uses ICT/SMC), building PLAYER ONE (React+Vite+Supabase), starting gym June 16, vegetarian+eggs, hungry to understand reality deeply — not just pass exams.

Generate a Week 1 exploration package that IGNITES curiosity before the formal study begins. This should make him eager to start Week 2 study.

Return ONLY valid JSON, no markdown, no backticks:
{
  "curiosity_hook": "2 sentences that make this topic feel urgent and personally relevant to Abhishek's life right now",
  "key_questions": [
    "uncomfortable or fascinating question to investigate this week",
    "question that connects this to AI engineering jobs",
    "question that connects to his trading or PLAYER ONE project"
  ],
  "concepts_to_investigate": [
    {
      "concept": "concept name",
      "why_first": "one sentence — what will clicking on this reveal"
    }
  ],
  "books": [
    {
      "title": "book title",
      "author": "author name",
      "read_this": "specific chapter or section to read this week — not the whole book",
      "free_url": "URL if freely available online, else null"
    }
  ],
  "papers": [
    {
      "title": "real paper title",
      "authors": "real author names",
      "year": "year",
      "one_line": "what makes this paper mind-bending in one sentence",
      "url": "arxiv or free URL"
    }
  ],
  "exploration_tasks": [
    "specific thing to do/find/try this week before formal study",
    "another exploration task — hands-on if possible"
  ]
}

Generate exactly 3 key_questions, 4 concepts_to_investigate, 2 books, 2 papers, 3 exploration_tasks.
All books and papers must be REAL with accurate information.
      
      ${memoryContext ? `
      RECENT AI TRACK PROGRESS:
      - ${memoryContext}

      Reference this in the exploration — show how this topic
      connects to what has been studied before.
      ` : ''}`;

      const { callGroq } = await import('../lib/groq');
      const result = await callGroq({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.85
      });

      if (result.error) {
        console.error('Groq error:', result.error)
        set({ isGeneratingExploration: false });
        return null;
      }

      let parsed = null;
      try {
        const raw = result.text;
        const cleaned = raw.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('Exploration JSON Parse Error:', parseErr, 'Raw:', result.text)
        set({ isGeneratingExploration: false });
        return null;
      }

      const { supabase } = await import('../lib/supabase');
      await supabase.from('ai_track_explorer').upsert({
        topic_id: topic.id,
        topic_title: topic.title,
        section_id: section.id,
        cluster: section.id[0],
        curiosity_hook: parsed.curiosity_hook,
        key_questions: parsed.key_questions,
        concepts_to_investigate: parsed.concepts_to_investigate,
        books: parsed.books,
        papers: parsed.papers,
        resources: parsed.exploration_tasks,
        generated_at: new Date().toISOString()
      }, { onConflict: 'topic_id' });

      set({ activeExploration: { ...parsed, topic_id: topic.id }, isGeneratingExploration: false });

      saveMemory({
        type: MEMORY_TYPES.AI_TRACK,
        content: `Explored topic: "${topic.title}" in section: "${section.id}"`,
        source: 'ai_track_exploration',
        importance: 7
      })

      return parsed;
    } catch (err) {
      console.error('generateExploration error:', err);
      set({ isGeneratingExploration: false });
      return null;
    }
  },

  loadExploration: async (topicId) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('ai_track_explorer')
        .select('*')
        .eq('topic_id', topicId)
        .maybeSingle();
      
      if (data) {
        set({ activeExploration: { ...data, topic_id: topicId } });
      } else {
        set({ activeExploration: null });
      }
      return data;
    } catch (err) {
      console.error('loadExploration error:', err);
      return null;
    }
  },

  clearExploration: () => set({ activeExploration: null })
}));

export { AI_TRACK_DATA };
