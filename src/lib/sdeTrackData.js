export const SDE_TRACK_DATA = {
  startDate: '2026-05-17',
  totalMonths: 8,
  targetRole: 'SDE-2 / Backend Engineer',
  dsaTarget: 474,

  phases: [
    {
      id: 'DSA',
      number: 1,
      name: 'DSA — Striver A2Z',
      tagline: 'Foundation. 474 problems. Everything else waits.',
      color: '#1A1A2E',
      bg: '#F0F0F8',
      duration: '3 months',
      durationWeeks: 12,
      unlockCondition: null,
      unlockAfter: null,
      resource: 'takeuforward.org/dsa/strivers-a2z-sheet',
      resourceUrl: 'https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z',
      totalProblems: 474,
      sections: [

        // ─────────────────────────────────────────
        // STEP 1 — LEARN THE BASICS (54 problems)
        // ─────────────────────────────────────────
        {
          id: 'S1',
          name: 'Step 1 — Learn the Basics',
          totalProblems: 54,
          subsections: [
            {
              id: 'S1-1',
              name: 'Things to Know in C++/Java/Python',
              problems: [
                { id: 'S1-1-1', title: 'Input Output', difficulty: 'Easy' },
                { id: 'S1-1-2', title: 'Cpp Basics', difficulty: 'Easy' },
                { id: 'S1-1-3', title: 'If ElseIf', difficulty: 'Easy' },
                { id: 'S1-1-4', title: 'Switch Case', difficulty: 'Easy' },
                { id: 'S1-1-5', title: 'What are arrays, strings?', difficulty: 'Easy' },
                { id: 'S1-1-6', title: 'For loops', difficulty: 'Easy' },
                { id: 'S1-1-7', title: 'While loops', difficulty: 'Easy' },
                { id: 'S1-1-8', title: 'Functions (Pass by Reference and Value)', difficulty: 'Easy' },
                { id: 'S1-1-9', title: 'Theory with examples', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S1-2',
              name: 'Build-up Logical Thinking',
              problems: [
                { id: 'S1-2-1', title: 'Logical Thinking — Easy and Medium', difficulty: 'Easy' },
                { id: 'S1-2-2', title: 'Logical Thinking — Hard', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S1-3',
              name: 'Patterns (22 problems)',
              problems: [
                { id: 'S1-3-1', title: 'Pattern 1 — Rectangle', difficulty: 'Easy' },
                { id: 'S1-3-2', title: 'Pattern 2 — Right Triangle', difficulty: 'Easy' },
                { id: 'S1-3-3', title: 'Pattern 3 — Right Triangle Numbers', difficulty: 'Easy' },
                { id: 'S1-3-4', title: 'Pattern 4 — Right Triangle Same Number', difficulty: 'Easy' },
                { id: 'S1-3-5', title: 'Pattern 5 — Inverted Right Triangle', difficulty: 'Easy' },
                { id: 'S1-3-6', title: 'Pattern 6 — Inverted Numbered Triangle', difficulty: 'Easy' },
                { id: 'S1-3-7', title: 'Pattern 7 — Star Pyramid', difficulty: 'Easy' },
                { id: 'S1-3-8', title: 'Pattern 8 — Inverted Star Pyramid', difficulty: 'Easy' },
                { id: 'S1-3-9', title: 'Pattern 9 — Diamond Star', difficulty: 'Easy' },
                { id: 'S1-3-10', title: 'Pattern 10 — Half Diamond', difficulty: 'Easy' },
                { id: 'S1-3-11', title: 'Pattern 11 — Binary Triangle', difficulty: 'Easy' },
                { id: 'S1-3-12', title: 'Pattern 12 — Number Crown', difficulty: 'Easy' },
                { id: 'S1-3-13', title: 'Pattern 13 — Increasing Number Triangle', difficulty: 'Easy' },
                { id: 'S1-3-14', title: 'Pattern 14 — Increasing Letter Triangle', difficulty: 'Easy' },
                { id: 'S1-3-15', title: 'Pattern 15 — Reverse Letter Triangle', difficulty: 'Easy' },
                { id: 'S1-3-16', title: 'Pattern 16 — Alpha Ramp', difficulty: 'Easy' },
                { id: 'S1-3-17', title: 'Pattern 17 — Alpha Hill', difficulty: 'Easy' },
                { id: 'S1-3-18', title: 'Pattern 18 — Alpha Triangle', difficulty: 'Easy' },
                { id: 'S1-3-19', title: 'Pattern 19 — Symmetric Void', difficulty: 'Easy' },
                { id: 'S1-3-20', title: 'Pattern 20 — Symmetric Butterfly', difficulty: 'Easy' },
                { id: 'S1-3-21', title: 'Pattern 21 — Hollow Rectangle', difficulty: 'Easy' },
                { id: 'S1-3-22', title: 'Pattern 22 — Number Pattern', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S1-4',
              name: 'Learn STL/Java-Collections',
              problems: [
                { id: 'S1-4-1', title: 'STL', difficulty: 'Easy' },
                { id: 'S1-4-2', title: 'Java Collections', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S1-5',
              name: 'Know Basic Maths',
              problems: [
                { id: 'S1-5-1', title: 'Count all Digits of a Number', difficulty: 'Easy' },
                { id: 'S1-5-2', title: 'Reverse a number', difficulty: 'Easy' },
                { id: 'S1-5-3', title: 'Palindrome Number', difficulty: 'Easy' },
                { id: 'S1-5-4', title: 'GCD of Two Numbers', difficulty: 'Easy' },
                { id: 'S1-5-5', title: 'Check if the Number is Armstrong', difficulty: 'Easy' },
                { id: 'S1-5-6', title: 'Print all Divisors', difficulty: 'Easy' },
                { id: 'S1-5-7', title: 'Check for Prime Number', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S1-6',
              name: 'Learn Basic Recursion',
              problems: [
                { id: 'S1-6-1', title: 'Understand recursion by print something N times', difficulty: 'Easy' },
                { id: 'S1-6-2', title: 'Print name N times using recursion', difficulty: 'Easy' },
                { id: 'S1-6-3', title: 'Print 1 to N using Recursion', difficulty: 'Easy' },
                { id: 'S1-6-4', title: 'Print N to 1 using Recursion', difficulty: 'Easy' },
                { id: 'S1-6-5', title: 'Sum of First N Numbers', difficulty: 'Easy' },
                { id: 'S1-6-6', title: 'Factorial of a given number', difficulty: 'Easy' },
                { id: 'S1-6-7', title: 'Reverse an array', difficulty: 'Easy' },
                { id: 'S1-6-8', title: 'Check if String is Palindrome or Not', difficulty: 'Easy' },
                { id: 'S1-6-9', title: 'Fibonacci Number', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S1-7',
              name: 'Learn Basic Hashing',
              problems: [
                { id: 'S1-7-1', title: 'Basic Hashing', difficulty: 'Easy' },
                { id: 'S1-7-2', title: 'Counting Frequencies of Array Elements', difficulty: 'Easy' },
                { id: 'S1-7-3', title: 'Highest Occurring Element in an Array', difficulty: 'Easy' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 2 — SORTING (7 problems)
        // ─────────────────────────────────────────
        {
          id: 'S2',
          name: 'Step 2 — Learn Important Sorting Techniques',
          totalProblems: 7,
          subsections: [
            {
              id: 'S2-1',
              name: 'Sorting I',
              problems: [
                { id: 'S2-1-1', title: 'Selection Sort', difficulty: 'Easy' },
                { id: 'S2-1-2', title: 'Bubble Sort', difficulty: 'Easy' },
                { id: 'S2-1-3', title: 'Insertion Sort', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S2-2',
              name: 'Sorting II',
              problems: [
                { id: 'S2-2-1', title: 'Merge Sort', difficulty: 'Medium' },
                { id: 'S2-2-2', title: 'Recursive Bubble Sort', difficulty: 'Easy' },
                { id: 'S2-2-3', title: 'Recursive Insertion Sort', difficulty: 'Easy' },
                { id: 'S2-2-4', title: 'Quick Sort', difficulty: 'Easy' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 3 — ARRAYS (40 problems)
        // ─────────────────────────────────────────
        {
          id: 'S3',
          name: 'Step 3 — Arrays [Easy → Medium → Hard]',
          totalProblems: 40,
          subsections: [
            {
              id: 'S3-1',
              name: 'Easy',
              problems: [
                { id: 'S3-1-1', title: 'Largest Element', difficulty: 'Easy' },
                { id: 'S3-1-2', title: 'Second Largest Element', difficulty: 'Easy' },
                { id: 'S3-1-3', title: 'Check if the Array is Sorted II', difficulty: 'Easy' },
                { id: 'S3-1-4', title: 'Remove duplicates from Sorted array', difficulty: 'Easy' },
                { id: 'S3-1-5', title: 'Left Rotate Array by One', difficulty: 'Easy' },
                { id: 'S3-1-6', title: 'Left Rotate Array by K Places', difficulty: 'Easy' },
                { id: 'S3-1-7', title: 'Move Zeros to End', difficulty: 'Easy' },
                { id: 'S3-1-8', title: 'Linear Search', difficulty: 'Easy' },
                { id: 'S3-1-9', title: 'Union of two sorted arrays', difficulty: 'Easy' },
                { id: 'S3-1-10', title: 'Find missing number', difficulty: 'Easy' },
                { id: 'S3-1-11', title: 'Maximum Consecutive Ones', difficulty: 'Easy' },
                { id: 'S3-1-12', title: 'Find the number that appears once, other numbers twice', difficulty: 'Medium' },
                { id: 'S3-1-13', title: 'Longest subarray with given sum K (positives)', difficulty: 'Medium' },
                { id: 'S3-1-14', title: 'Longest subarray with sum K', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S3-2',
              name: 'Medium',
              problems: [
                { id: 'S3-2-1', title: 'Two Sum', difficulty: 'Easy' },
                { id: 'S3-2-2', title: 'Sort an array of 0\'s 1\'s and 2\'s', difficulty: 'Medium' },
                { id: 'S3-2-3', title: 'Majority Element-I', difficulty: 'Easy' },
                { id: 'S3-2-4', title: 'Kadane\'s Algorithm', difficulty: 'Medium' },
                { id: 'S3-2-5', title: 'Print subarray with maximum subarray sum', difficulty: 'Medium' },
                { id: 'S3-2-6', title: 'Stock Buy and Sell', difficulty: 'Medium' },
                { id: 'S3-2-7', title: 'Rearrange array elements by sign', difficulty: 'Medium' },
                { id: 'S3-2-8', title: 'Next Permutation', difficulty: 'Medium' },
                { id: 'S3-2-9', title: 'Leaders in an Array', difficulty: 'Medium' },
                { id: 'S3-2-10', title: 'Longest Consecutive Sequence in an Array', difficulty: 'Medium' },
                { id: 'S3-2-11', title: 'Set Matrix Zeroes', difficulty: 'Medium' },
                { id: 'S3-2-12', title: 'Rotate matrix by 90 degrees', difficulty: 'Medium' },
                { id: 'S3-2-13', title: 'Print the matrix in spiral manner', difficulty: 'Medium' },
                { id: 'S3-2-14', title: 'Count subarrays with given sum', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S3-3',
              name: 'Hard',
              problems: [
                { id: 'S3-3-1', title: 'Pascal\'s Triangle I', difficulty: 'Easy' },
                { id: 'S3-3-2', title: 'Majority Element-II', difficulty: 'Hard' },
                { id: 'S3-3-3', title: '3 Sum', difficulty: 'Medium' },
                { id: 'S3-3-4', title: '4 Sum', difficulty: 'Medium' },
                { id: 'S3-3-5', title: 'Largest Subarray with Sum 0', difficulty: 'Medium' },
                { id: 'S3-3-6', title: 'Count subarrays with given xor K', difficulty: 'Hard' },
                { id: 'S3-3-7', title: 'Merge Overlapping Subintervals', difficulty: 'Medium' },
                { id: 'S3-3-8', title: 'Merge two sorted arrays without extra space', difficulty: 'Medium' },
                { id: 'S3-3-9', title: 'Find the repeating and missing number', difficulty: 'Hard' },
                { id: 'S3-3-10', title: 'Count Inversions', difficulty: 'Hard' },
                { id: 'S3-3-11', title: 'Reverse Pairs', difficulty: 'Hard' },
                { id: 'S3-3-12', title: 'Maximum Product Subarray in an Array', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 4 — BINARY SEARCH (32 problems)
        // ─────────────────────────────────────────
        {
          id: 'S4',
          name: 'Step 4 — Binary Search [1D, 2D, Search Space]',
          totalProblems: 32,
          subsections: [
            {
              id: 'S4-1',
              name: 'BS on 1D Arrays',
              problems: [
                { id: 'S4-1-1', title: 'Search X in sorted array', difficulty: 'Easy' },
                { id: 'S4-1-2', title: 'Lower Bound', difficulty: 'Easy' },
                { id: 'S4-1-3', title: 'Upper Bound', difficulty: 'Easy' },
                { id: 'S4-1-4', title: 'Search insert position', difficulty: 'Easy' },
                { id: 'S4-1-5', title: 'Floor and Ceil in Sorted Array', difficulty: 'Easy' },
                { id: 'S4-1-6', title: 'First and last occurrence', difficulty: 'Easy' },
                { id: 'S4-1-7', title: 'Count Occurrences in a Sorted Array', difficulty: 'Easy' },
                { id: 'S4-1-8', title: 'Search in rotated sorted array-I', difficulty: 'Medium' },
                { id: 'S4-1-9', title: 'Search in rotated sorted array-II', difficulty: 'Medium' },
                { id: 'S4-1-10', title: 'Find minimum in Rotated Sorted Array', difficulty: 'Easy' },
                { id: 'S4-1-11', title: 'Find out how many times the array is rotated', difficulty: 'Easy' },
                { id: 'S4-1-12', title: 'Single element in a Sorted Array', difficulty: 'Medium' },
                { id: 'S4-1-13', title: 'Find peak element', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S4-2',
              name: 'BS on Answers',
              problems: [
                { id: 'S4-2-1', title: 'Find square root of a number', difficulty: 'Medium' },
                { id: 'S4-2-2', title: 'Find Nth root of a number', difficulty: 'Medium' },
                { id: 'S4-2-3', title: 'Koko eating bananas', difficulty: 'Medium' },
                { id: 'S4-2-4', title: 'Minimum days to make M bouquets', difficulty: 'Medium' },
                { id: 'S4-2-5', title: 'Find the smallest divisor', difficulty: 'Medium' },
                { id: 'S4-2-6', title: 'Capacity to Ship Packages Within D Days', difficulty: 'Medium' },
                { id: 'S4-2-7', title: 'Kth Missing Positive Number', difficulty: 'Medium' },
                { id: 'S4-2-8', title: 'Aggressive Cows', difficulty: 'Hard' },
                { id: 'S4-2-9', title: 'Book Allocation Problem', difficulty: 'Hard' },
                { id: 'S4-2-10', title: 'Split array - largest sum', difficulty: 'Hard' },
                { id: 'S4-2-11', title: 'Painter\'s Partition', difficulty: 'Medium' },
                { id: 'S4-2-12', title: 'Minimize Max Distance to Gas Station', difficulty: 'Hard' },
                { id: 'S4-2-13', title: 'Median of 2 sorted arrays', difficulty: 'Hard' },
                { id: 'S4-2-14', title: 'Kth element of 2 sorted arrays', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S4-3',
              name: 'BS on 2D Arrays',
              problems: [
                { id: 'S4-3-1', title: 'Find row with maximum 1\'s', difficulty: 'Easy' },
                { id: 'S4-3-2', title: 'Search in a 2D matrix', difficulty: 'Hard' },
                { id: 'S4-3-3', title: 'Search in 2D matrix - II', difficulty: 'Hard' },
                { id: 'S4-3-4', title: 'Find Peak Element - II', difficulty: 'Medium' },
                { id: 'S4-3-5', title: 'Matrix Median', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 5 — STRINGS (15 problems)
        // ─────────────────────────────────────────
        {
          id: 'S5',
          name: 'Step 5 — Strings [Basic and Medium]',
          totalProblems: 15,
          subsections: [
            {
              id: 'S5-1',
              name: 'Basic and Easy String Problems',
              problems: [
                { id: 'S5-1-1', title: 'Remove Outermost Parentheses', difficulty: 'Medium' },
                { id: 'S5-1-2', title: 'Reverse words in a given string / Palindrome Check', difficulty: 'Medium' },
                { id: 'S5-1-3', title: 'Largest Odd Number in a String', difficulty: 'Easy' },
                { id: 'S5-1-4', title: 'Longest Common Prefix', difficulty: 'Easy' },
                { id: 'S5-1-5', title: 'Isomorphic String', difficulty: 'Easy' },
                { id: 'S5-1-6', title: 'Rotate String', difficulty: 'Easy' },
                { id: 'S5-1-7', title: 'Check if two strings are anagram of each other', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S5-2',
              name: 'Medium String Problems',
              problems: [
                { id: 'S5-2-1', title: 'Sort Characters by Frequency', difficulty: 'Easy' },
                { id: 'S5-2-2', title: 'Maximum Nesting Depth of the Parentheses', difficulty: 'Medium' },
                { id: 'S5-2-3', title: 'Roman to Integer', difficulty: 'Medium' },
                { id: 'S5-2-4', title: 'String to Integer (atoi)', difficulty: 'Medium' },
                { id: 'S5-2-5', title: 'Count Number of Substrings', difficulty: 'Easy' },
                { id: 'S5-2-6', title: 'Longest Palindromic Substring', difficulty: 'Medium' },
                { id: 'S5-2-7', title: 'Sum of Beauty of All Substrings', difficulty: 'Medium' },
                { id: 'S5-2-8', title: 'Reverse every word in a string', difficulty: 'Medium' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 6 — LINKED LIST (31 problems)
        // ─────────────────────────────────────────
        {
          id: 'S6',
          name: 'Step 6 — LinkedList [Single, Double, Medium, Hard]',
          totalProblems: 31,
          subsections: [
            {
              id: 'S6-1',
              name: 'Learn 1D LinkedList',
              problems: [
                { id: 'S6-1-1', title: 'Introduction to Singly LinkedList', difficulty: 'Easy' },
                { id: 'S6-1-2', title: 'Insertion at the head of Linked List', difficulty: 'Easy' },
                { id: 'S6-1-3', title: 'Deletion of the head of LL', difficulty: 'Easy' },
                { id: 'S6-1-4', title: 'Find the length of the Linked List', difficulty: 'Easy' },
                { id: 'S6-1-5', title: 'Search in Linked List', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S6-2',
              name: 'Learn Doubly LinkedList',
              problems: [
                { id: 'S6-2-1', title: 'Introduction to Doubly LL', difficulty: 'Easy' },
                { id: 'S6-2-2', title: 'Insert node before head in Doubly Linked List', difficulty: 'Easy' },
                { id: 'S6-2-3', title: 'Delete head of Doubly Linked List', difficulty: 'Easy' },
                { id: 'S6-2-4', title: 'Reverse a Doubly Linked List', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S6-3',
              name: 'Medium Problems of LL',
              problems: [
                { id: 'S6-3-1', title: 'Middle of a LinkedList [Tortoise-Hare Method]', difficulty: 'Easy' },
                { id: 'S6-3-2', title: 'Reverse a LinkedList [Iterative]', difficulty: 'Medium' },
                { id: 'S6-3-3', title: 'Reverse a LL [Recursive]', difficulty: 'Medium' },
                { id: 'S6-3-4', title: 'Detect a loop in LL', difficulty: 'Medium' },
                { id: 'S6-3-5', title: 'Find the starting point in LL', difficulty: 'Medium' },
                { id: 'S6-3-6', title: 'Length of loop in LL', difficulty: 'Medium' },
                { id: 'S6-3-7', title: 'Check if LL is palindrome or not', difficulty: 'Medium' },
                { id: 'S6-3-8', title: 'Segregate odd and even nodes in Linked List', difficulty: 'Medium' },
                { id: 'S6-3-9', title: 'Remove Nth node from the back of the LL', difficulty: 'Medium' },
                { id: 'S6-3-10', title: 'Delete the middle node in LL', difficulty: 'Medium' },
                { id: 'S6-3-11', title: 'Sort LL', difficulty: 'Hard' },
                { id: 'S6-3-12', title: 'Sort a Linked List of 0\'s 1\'s and 2\'s', difficulty: 'Medium' },
                { id: 'S6-3-13', title: 'Find the intersection point of Y LL', difficulty: 'Medium' },
                { id: 'S6-3-14', title: 'Add one to a number represented by LL', difficulty: 'Medium' },
                { id: 'S6-3-15', title: 'Add two numbers in Linked List', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S6-4',
              name: 'Medium Problems of DLL',
              problems: [
                { id: 'S6-4-1', title: 'Delete all occurrences of a key in DLL', difficulty: 'Hard' },
                { id: 'S6-4-2', title: 'Find Pairs with Given Sum in Doubly Linked List', difficulty: 'Medium' },
                { id: 'S6-4-3', title: 'Remove duplicates from sorted DLL', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S6-5',
              name: 'Hard Problems of LL',
              problems: [
                { id: 'S6-5-1', title: 'Reverse LL in group of given size K', difficulty: 'Hard' },
                { id: 'S6-5-2', title: 'Rotate a LL', difficulty: 'Hard' },
                { id: 'S6-5-3', title: 'Flattening of LL', difficulty: 'Hard' },
                { id: 'S6-5-4', title: 'Clone a LL with random and next pointer', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 7 — RECURSION (25 problems)
        // ─────────────────────────────────────────
        {
          id: 'S7',
          name: 'Step 7 — Recursion [PatternWise]',
          totalProblems: 25,
          subsections: [
            {
              id: 'S7-1',
              name: 'Get a Strong Hold',
              problems: [
                { id: 'S7-1-1', title: 'Recursive Implementation of atoi()', difficulty: 'Medium' },
                { id: 'S7-1-2', title: 'Pow(x, n)', difficulty: 'Easy' },
                { id: 'S7-1-3', title: 'Count Good Numbers', difficulty: 'Medium' },
                { id: 'S7-1-4', title: 'Sort a stack using recursion', difficulty: 'Medium' },
                { id: 'S7-1-5', title: 'Reverse a Stack', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S7-2',
              name: 'Subsequences Pattern',
              problems: [
                { id: 'S7-2-1', title: 'Generate Binary Strings Without Consecutive 1s', difficulty: 'Medium' },
                { id: 'S7-2-2', title: 'Generate Parentheses', difficulty: 'Medium' },
                { id: 'S7-2-3', title: 'Power Set', difficulty: 'Medium' },
                { id: 'S7-2-4', title: 'Learn All Patterns of Subsequences (Theory)', difficulty: 'Easy' },
                { id: 'S7-2-5', title: 'Count all subsequences with sum K', difficulty: 'Easy' },
                { id: 'S7-2-6', title: 'Check if there exists a subsequence with sum K', difficulty: 'Easy' },
                { id: 'S7-2-7', title: 'Combination Sum', difficulty: 'Medium' },
                { id: 'S7-2-8', title: 'Combination Sum II', difficulty: 'Medium' },
                { id: 'S7-2-9', title: 'Subsets I', difficulty: 'Medium' },
                { id: 'S7-2-10', title: 'Subsets II', difficulty: 'Medium' },
                { id: 'S7-2-11', title: 'Combination Sum III', difficulty: 'Medium' },
                { id: 'S7-2-12', title: 'Letter Combinations of a Phone Number', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S7-3',
              name: 'Trying out all Combos / Hard',
              problems: [
                { id: 'S7-3-1', title: 'Palindrome partitioning', difficulty: 'Hard' },
                { id: 'S7-3-2', title: 'Word Search', difficulty: 'Hard' },
                { id: 'S7-3-3', title: 'N Queen', difficulty: 'Hard' },
                { id: 'S7-3-4', title: 'Rat in a Maze', difficulty: 'Hard' },
                { id: 'S7-3-5', title: 'Word Break', difficulty: 'Medium' },
                { id: 'S7-3-6', title: 'M Coloring Problem', difficulty: 'Hard' },
                { id: 'S7-3-7', title: 'Sudoku Solver', difficulty: 'Hard' },
                { id: 'S7-3-8', title: 'Expression Add Operators', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 8 — BIT MANIPULATION (18 problems)
        // ─────────────────────────────────────────
        {
          id: 'S8',
          name: 'Step 8 — Bit Manipulation [Concepts & Problems]',
          totalProblems: 18,
          subsections: [
            {
              id: 'S8-1',
              name: 'Learn Bit Manipulation',
              problems: [
                { id: 'S8-1-1', title: 'Introduction to Bits and Tricks', difficulty: 'Easy' },
                { id: 'S8-1-2', title: 'Check if the i-th bit is Set or Not', difficulty: 'Easy' },
                { id: 'S8-1-3', title: 'Check if a Number is Odd or Not', difficulty: 'Easy' },
                { id: 'S8-1-4', title: 'Check if a Number is Power of 2 or Not', difficulty: 'Easy' },
                { id: 'S8-1-5', title: 'Count the Number of Set Bits', difficulty: 'Easy' },
                { id: 'S8-1-6', title: 'Set/Unset the rightmost unset bit', difficulty: 'Easy' },
                { id: 'S8-1-7', title: 'Swap Two Numbers', difficulty: 'Easy' },
                { id: 'S8-1-8', title: 'Divide two numbers without multiplication and division', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S8-2',
              name: 'Interview Problems',
              problems: [
                { id: 'S8-2-1', title: 'Minimum Bit Flips to Convert Number', difficulty: 'Medium' },
                { id: 'S8-2-2', title: 'Single Number - I', difficulty: 'Medium' },
                { id: 'S8-2-3', title: 'Power Set Bit Manipulation', difficulty: 'Medium' },
                { id: 'S8-2-4', title: 'XOR of numbers in a given range', difficulty: 'Medium' },
                { id: 'S8-2-5', title: 'Single Number - III', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S8-3',
              name: 'Advanced Maths',
              problems: [
                { id: 'S8-3-1', title: 'Print Prime Factors of a Number', difficulty: 'Hard' },
                { id: 'S8-3-2', title: 'Divisors of a Number', difficulty: 'Easy' },
                { id: 'S8-3-3', title: 'Count primes in range L to R', difficulty: 'Hard' },
                { id: 'S8-3-4', title: 'Prime factorisation of a Number', difficulty: 'Hard' },
                { id: 'S8-3-5', title: 'Pow(x,n)', difficulty: 'Easy' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 9 — STACK & QUEUE (30 problems)
        // ─────────────────────────────────────────
        {
          id: 'S9',
          name: 'Step 9 — Stack and Queues',
          totalProblems: 30,
          subsections: [
            {
              id: 'S9-1',
              name: 'Learning',
              problems: [
                { id: 'S9-1-1', title: 'Implement Stack using Arrays', difficulty: 'Easy' },
                { id: 'S9-1-2', title: 'Implement Queue using Arrays', difficulty: 'Easy' },
                { id: 'S9-1-3', title: 'Implement Stack using Queue', difficulty: 'Easy' },
                { id: 'S9-1-4', title: 'Implement Queue using Stack', difficulty: 'Easy' },
                { id: 'S9-1-5', title: 'Implement stack using Linkedlist', difficulty: 'Easy' },
                { id: 'S9-1-6', title: 'Implement queue using Linkedlist', difficulty: 'Easy' },
                { id: 'S9-1-7', title: 'Balanced Parenthesis', difficulty: 'Easy' },
                { id: 'S9-1-8', title: 'Implement Min Stack', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S9-2',
              name: 'Prefix Infix Postfix Conversion',
              problems: [
                { id: 'S9-2-1', title: 'Infix to Postfix Conversion', difficulty: 'Medium' },
                { id: 'S9-2-2', title: 'Prefix to Infix Conversion', difficulty: 'Medium' },
                { id: 'S9-2-3', title: 'Prefix to Postfix Conversion', difficulty: 'Medium' },
                { id: 'S9-2-4', title: 'Postfix to Prefix Conversion', difficulty: 'Medium' },
                { id: 'S9-2-5', title: 'Postfix to Infix Conversion', difficulty: 'Easy' },
                { id: 'S9-2-6', title: 'Infix to Prefix Conversion', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S9-3',
              name: 'Monotonic Stack/Queue [Very Important]',
              problems: [
                { id: 'S9-3-1', title: 'Next Greater Element', difficulty: 'Medium' },
                { id: 'S9-3-2', title: 'Next Greater Element - 2', difficulty: 'Medium' },
                { id: 'S9-3-3', title: 'Next Smaller Element', difficulty: 'Medium' },
                { id: 'S9-3-4', title: 'Number of Greater Elements to the Right', difficulty: 'Easy' },
                { id: 'S9-3-5', title: 'Trapping Rainwater', difficulty: 'Hard' },
                { id: 'S9-3-6', title: 'Sum of Subarray Minimums', difficulty: 'Medium' },
                { id: 'S9-3-7', title: 'Asteroid Collision', difficulty: 'Medium' },
                { id: 'S9-3-8', title: 'Sum of Subarray Ranges', difficulty: 'Medium' },
                { id: 'S9-3-9', title: 'Remove K Digits', difficulty: 'Medium' },
                { id: 'S9-3-10', title: 'Largest rectangle in a histogram', difficulty: 'Hard' },
                { id: 'S9-3-11', title: 'Maximum Rectangles', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S9-4',
              name: 'Implementation Problems',
              problems: [
                { id: 'S9-4-1', title: 'Sliding Window Maximum', difficulty: 'Hard' },
                { id: 'S9-4-2', title: 'Stock span problem', difficulty: 'Hard' },
                { id: 'S9-4-3', title: 'Celebrity Problem', difficulty: 'Hard' },
                { id: 'S9-4-4', title: 'LRU Cache', difficulty: 'Medium' },
                { id: 'S9-4-5', title: 'LFU Cache', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 10 — SLIDING WINDOW (12 problems)
        // ─────────────────────────────────────────
        {
          id: 'S10',
          name: 'Step 10 — Sliding Window & Two Pointer',
          totalProblems: 12,
          subsections: [
            {
              id: 'S10-1',
              name: 'Medium Problems',
              problems: [
                { id: 'S10-1-1', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
                { id: 'S10-1-2', title: 'Max Consecutive Ones III', difficulty: 'Medium' },
                { id: 'S10-1-3', title: 'Fruit Into Baskets', difficulty: 'Medium' },
                { id: 'S10-1-4', title: 'Longest Repeating Character Replacement', difficulty: 'Hard' },
                { id: 'S10-1-5', title: 'Binary Subarrays With Sum', difficulty: 'Hard' },
                { id: 'S10-1-6', title: 'Count number of Nice subarrays', difficulty: 'Hard' },
                { id: 'S10-1-7', title: 'Number of Substrings Containing All Three Characters', difficulty: 'Hard' },
                { id: 'S10-1-8', title: 'Maximum Points You Can Obtain from Cards', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S10-2',
              name: 'Hard Problems',
              problems: [
                { id: 'S10-2-1', title: 'Longest Substring With At Most K Distinct Characters', difficulty: 'Hard' },
                { id: 'S10-2-2', title: 'Subarrays with K Different Integers', difficulty: 'Medium' },
                { id: 'S10-2-3', title: 'Minimum Window Substring', difficulty: 'Hard' },
                { id: 'S10-2-4', title: 'Minimum Window Subsequence', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 11 — HEAPS (17 problems)
        // ─────────────────────────────────────────
        {
          id: 'S11',
          name: 'Step 11 — Heaps [Learning, Medium, Hard]',
          totalProblems: 17,
          subsections: [
            {
              id: 'S11-1',
              name: 'Learning',
              problems: [
                { id: 'S11-1-1', title: 'Heaps (Theory Video)', difficulty: 'Easy' },
                { id: 'S11-1-2', title: 'Implement Min Heap', difficulty: 'Medium' },
                { id: 'S11-1-3', title: 'Check if an array represents a min heap', difficulty: 'Medium' },
                { id: 'S11-1-4', title: 'Convert Min Heap to Max Heap', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S11-2',
              name: 'Medium Problems',
              problems: [
                { id: 'S11-2-1', title: 'K-th Largest element in an array', difficulty: 'Medium' },
                { id: 'S11-2-2', title: 'Kth smallest element in an array', difficulty: 'Medium' },
                { id: 'S11-2-3', title: 'Sort K sorted array', difficulty: 'Easy' },
                { id: 'S11-2-4', title: 'Merge K sorted Lists', difficulty: 'Hard' },
                { id: 'S11-2-5', title: 'Replace Elements by Their Rank', difficulty: 'Easy' },
                { id: 'S11-2-6', title: 'Task Scheduler', difficulty: 'Medium' },
                { id: 'S11-2-7', title: 'Hand of Straights', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S11-3',
              name: 'Hard Problems',
              problems: [
                { id: 'S11-3-1', title: 'Design Twitter', difficulty: 'Medium' },
                { id: 'S11-3-2', title: 'Minimum Cost to Connect Sticks', difficulty: 'Medium' },
                { id: 'S11-3-3', title: 'Kth largest element in a stream of running integers', difficulty: 'Hard' },
                { id: 'S11-3-4', title: 'Maximum Sum Combination', difficulty: 'Hard' },
                { id: 'S11-3-5', title: 'Find Median from Data Stream', difficulty: 'Hard' },
                { id: 'S11-3-6', title: 'Top K Frequent Elements', difficulty: 'Medium' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 12 — GREEDY (15 problems)
        // ─────────────────────────────────────────
        {
          id: 'S12',
          name: 'Step 12 — Greedy Algorithms [Easy, Medium/Hard]',
          totalProblems: 15,
          subsections: [
            {
              id: 'S12-1',
              name: 'Easy Problems',
              problems: [
                { id: 'S12-1-1', title: 'Assign Cookies', difficulty: 'Easy' },
                { id: 'S12-1-2', title: 'Fractional Knapsack', difficulty: 'Medium' },
                { id: 'S12-1-3', title: 'Lemonade Change', difficulty: 'Easy' },
                { id: 'S12-1-4', title: 'Valid Parenthesis Checker', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S12-2',
              name: 'Medium/Hard',
              problems: [
                { id: 'S12-2-1', title: 'N meetings in one room', difficulty: 'Medium' },
                { id: 'S12-2-2', title: 'Jump Game - I', difficulty: 'Easy' },
                { id: 'S12-2-3', title: 'Jump Game II', difficulty: 'Medium' },
                { id: 'S12-2-4', title: 'Minimum number of platforms required for a railway', difficulty: 'Medium' },
                { id: 'S12-2-5', title: 'Job sequencing Problem', difficulty: 'Medium' },
                { id: 'S12-2-6', title: 'Candy', difficulty: 'Hard' },
                { id: 'S12-2-7', title: 'Shortest Job First', difficulty: 'Medium' },
                { id: 'S12-2-8', title: 'Program for Least Recently Used (LRU) Page Replacement', difficulty: 'Medium' },
                { id: 'S12-2-9', title: 'Insert Interval', difficulty: 'Medium' },
                { id: 'S12-2-10', title: 'Merge Intervals', difficulty: 'Medium' },
                { id: 'S12-2-11', title: 'Non-overlapping Intervals', difficulty: 'Medium' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 13 — BINARY TREES (38 problems)
        // ─────────────────────────────────────────
        {
          id: 'S13',
          name: 'Step 13 — Binary Trees [Traversals, Medium, Hard]',
          totalProblems: 38,
          subsections: [
            {
              id: 'S13-1',
              name: 'Traversals',
              problems: [
                { id: 'S13-1-1', title: 'Introduction to Trees', difficulty: 'Easy' },
                { id: 'S13-1-2', title: 'Binary Tree Representation in Java', difficulty: 'Easy' },
                { id: 'S13-1-3', title: 'Pre, Post, Inorder in one traversal', difficulty: 'Easy' },
                { id: 'S13-1-4', title: 'Preorder Traversal', difficulty: 'Easy' },
                { id: 'S13-1-5', title: 'Inorder Traversal of Binary Tree', difficulty: 'Easy' },
                { id: 'S13-1-6', title: 'Postorder Traversal', difficulty: 'Easy' },
                { id: 'S13-1-7', title: 'Level Order Traversal', difficulty: 'Easy' },
                { id: 'S13-1-8', title: 'Iterative Preorder Traversal of Binary Tree', difficulty: 'Easy' },
                { id: 'S13-1-9', title: 'Iterative Inorder Traversal of Binary Tree', difficulty: 'Easy' },
                { id: 'S13-1-10', title: 'Post-order Traversal using 2 stack', difficulty: 'Easy' },
                { id: 'S13-1-11', title: 'Post-order Traversal using 1 stack', difficulty: 'Easy' },
                { id: 'S13-1-12', title: 'Preorder, Inorder, and Postorder in one Traversal', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S13-2',
              name: 'Medium Problems',
              problems: [
                { id: 'S13-2-1', title: 'Maximum Depth in BT', difficulty: 'Medium' },
                { id: 'S13-2-2', title: 'Check for balanced binary tree', difficulty: 'Medium' },
                { id: 'S13-2-3', title: 'Diameter of Binary Tree', difficulty: 'Easy' },
                { id: 'S13-2-4', title: 'Maximum path sum', difficulty: 'Medium' },
                { id: 'S13-2-5', title: 'Check if two trees are identical or not', difficulty: 'Medium' },
                { id: 'S13-2-6', title: 'Zig Zag or Spiral Traversal', difficulty: 'Medium' },
                { id: 'S13-2-7', title: 'Boundary Traversal', difficulty: 'Medium' },
                { id: 'S13-2-8', title: 'Vertical Order Traversal', difficulty: 'Medium' },
                { id: 'S13-2-9', title: 'Top View of BT', difficulty: 'Medium' },
                { id: 'S13-2-10', title: 'Bottom view of BT', difficulty: 'Medium' },
                { id: 'S13-2-11', title: 'Right/Left View of Binary Tree', difficulty: 'Medium' },
                { id: 'S13-2-12', title: 'Symmetric Binary Tree', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S13-3',
              name: 'Hard Problems',
              problems: [
                { id: 'S13-3-1', title: 'Print root to leaf path in BT', difficulty: 'Medium' },
                { id: 'S13-3-2', title: 'LCA in BT', difficulty: 'Hard' },
                { id: 'S13-3-3', title: 'Maximum Width of BT', difficulty: 'Medium' },
                { id: 'S13-3-4', title: 'Children Sum Property in Binary Tree', difficulty: 'Medium' },
                { id: 'S13-3-5', title: 'Print all nodes at a distance of K in BT', difficulty: 'Hard' },
                { id: 'S13-3-6', title: 'Minimum time taken to burn the BT from a given Node', difficulty: 'Hard' },
                { id: 'S13-3-7', title: 'Count total nodes in a complete BT', difficulty: 'Easy' },
                { id: 'S13-3-8', title: 'Requirements needed to construct a unique BT', difficulty: 'Medium' },
                { id: 'S13-3-9', title: 'Construct a BT from Preorder and Inorder', difficulty: 'Hard' },
                { id: 'S13-3-10', title: 'Construct the Binary Tree from Postorder and Inorder', difficulty: 'Hard' },
                { id: 'S13-3-11', title: 'Serialize and De-serialize BT', difficulty: 'Hard' },
                { id: 'S13-3-12', title: 'Morris Preorder Traversal of a Binary Tree', difficulty: 'Hard' },
                { id: 'S13-3-13', title: 'Morris Inorder Traversal of a Binary Tree', difficulty: 'Hard' },
                { id: 'S13-3-14', title: 'Flatten Binary Tree to Linked List', difficulty: 'Medium' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 14 — BST (16 problems)
        // ─────────────────────────────────────────
        {
          id: 'S14',
          name: 'Step 14 — Binary Search Trees [Concept and Problems]',
          totalProblems: 16,
          subsections: [
            {
              id: 'S14-1',
              name: 'Concepts',
              problems: [
                { id: 'S14-1-1', title: 'Introduction to BST', difficulty: 'Easy' },
                { id: 'S14-1-2', title: 'Search in a Binary Search Tree', difficulty: 'Easy' },
                { id: 'S14-1-3', title: 'Find Min/Max in BST', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S14-2',
              name: 'Practice Problems',
              problems: [
                { id: 'S14-2-1', title: 'Floor and Ceil in a BST', difficulty: 'Easy' },
                { id: 'S14-2-2', title: 'Floor in a Binary Search Tree', difficulty: 'Easy' },
                { id: 'S14-2-3', title: 'Insert a given node in BST', difficulty: 'Medium' },
                { id: 'S14-2-4', title: 'Delete a node in BST', difficulty: 'Medium' },
                { id: 'S14-2-5', title: 'Kth Smallest and Largest element in BST', difficulty: 'Medium' },
                { id: 'S14-2-6', title: 'Check if a tree is a BST or not', difficulty: 'Medium' },
                { id: 'S14-2-7', title: 'LCA in BST', difficulty: 'Medium' },
                { id: 'S14-2-8', title: 'Construct a BST from a preorder traversal', difficulty: 'Medium' },
                { id: 'S14-2-9', title: 'Inorder Successor/Predecessor in BST', difficulty: 'Medium' },
                { id: 'S14-2-10', title: 'Merge 2 BST\'s', difficulty: 'Hard' },
                { id: 'S14-2-11', title: 'Two Sum In BST | Check if there exists a pair with Sum K', difficulty: 'Hard' },
                { id: 'S14-2-12', title: 'Correct BST with two nodes swapped', difficulty: 'Hard' },
                { id: 'S14-2-13', title: 'Largest BST in Binary Tree', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 15 — GRAPHS (53 problems)
        // ─────────────────────────────────────────
        {
          id: 'S15',
          name: 'Step 15 — Graphs [Concepts & Problems]',
          totalProblems: 53,
          subsections: [
            {
              id: 'S15-1',
              name: 'Learning',
              problems: [
                { id: 'S15-1-1', title: 'Introduction to Graph', difficulty: 'Easy' },
                { id: 'S15-1-2', title: 'Graph Representation | C++', difficulty: 'Easy' },
                { id: 'S15-1-3', title: 'Graph Representation | Java', difficulty: 'Easy' },
                { id: 'S15-1-4', title: 'Connected Components', difficulty: 'Medium' },
                { id: 'S15-1-5', title: 'Traversal Techniques (BFS)', difficulty: 'Medium' },
                { id: 'S15-1-6', title: 'DFS', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S15-2',
              name: 'Problems on BFS/DFS',
              problems: [
                { id: 'S15-2-1', title: 'Number of provinces', difficulty: 'Medium' },
                { id: 'S15-2-2', title: 'Connected Components Problem in Matrix', difficulty: 'Medium' },
                { id: 'S15-2-3', title: 'Rotten Oranges', difficulty: 'Medium' },
                { id: 'S15-2-4', title: 'Flood fill algorithm', difficulty: 'Medium' },
                { id: 'S15-2-5', title: 'Cycle Detection in Undirected Graph (bfs)', difficulty: 'Hard' },
                { id: 'S15-2-6', title: 'Detect a cycle in an undirected graph (dfs)', difficulty: 'Hard' },
                { id: 'S15-2-7', title: 'Distance of nearest cell having one', difficulty: 'Medium' },
                { id: 'S15-2-8', title: 'Surrounded Regions', difficulty: 'Medium' },
                { id: 'S15-2-9', title: 'Number of enclaves', difficulty: 'Medium' },
                { id: 'S15-2-10', title: 'Word ladder I', difficulty: 'Hard' },
                { id: 'S15-2-11', title: 'Word ladder II', difficulty: 'Hard' },
                { id: 'S15-2-12', title: 'Number of islands', difficulty: 'Medium' },
                { id: 'S15-2-13', title: 'Bipartite Graph (DFS)', difficulty: 'Hard' },
                { id: 'S15-2-14', title: 'Cycle Detection in Directed Graph (DFS)', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S15-3',
              name: 'Topo Sort and Problems',
              problems: [
                { id: 'S15-3-1', title: 'Topo Sort (DFS)', difficulty: 'Hard' },
                { id: 'S15-3-2', title: 'Topological sort — Kahn\'s algorithm (BFS)', difficulty: 'Hard' },
                { id: 'S15-3-3', title: 'Detect a cycle in a directed graph', difficulty: 'Hard' },
                { id: 'S15-3-4', title: 'Course Schedule I', difficulty: 'Hard' },
                { id: 'S15-3-5', title: 'Course Schedule II', difficulty: 'Medium' },
                { id: 'S15-3-6', title: 'Find eventual safe states', difficulty: 'Hard' },
                { id: 'S15-3-7', title: 'Alien Dictionary', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S15-4',
              name: 'Shortest Path Algorithms',
              problems: [
                { id: 'S15-4-1', title: 'Shortest path in undirected graph with unit weights', difficulty: 'Hard' },
                { id: 'S15-4-2', title: 'Shortest path in DAG', difficulty: 'Hard' },
                { id: 'S15-4-3', title: 'Dijkstra\'s Algorithm', difficulty: 'Hard' },
                { id: 'S15-4-4', title: 'Why priority Queue is used in Dijkstra\'s Algorithm', difficulty: 'Hard' },
                { id: 'S15-4-5', title: 'Shortest Distance in a Binary Maze', difficulty: 'Hard' },
                { id: 'S15-4-6', title: 'Path with minimum effort', difficulty: 'Hard' },
                { id: 'S15-4-7', title: 'Cheapest flight within K stops', difficulty: 'Hard' },
                { id: 'S15-4-8', title: 'Network Delay Time', difficulty: 'Medium' },
                { id: 'S15-4-9', title: 'Number of ways to arrive at destination', difficulty: 'Hard' },
                { id: 'S15-4-10', title: 'Minimum multiplications to reach end', difficulty: 'Hard' },
                { id: 'S15-4-11', title: 'Bellman Ford Algorithm', difficulty: 'Hard' },
                { id: 'S15-4-12', title: 'Floyd Warshall Algorithm', difficulty: 'Hard' },
                { id: 'S15-4-13', title: 'Find the city with the smallest number of neighbors', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S15-5',
              name: 'Minimum Spanning Tree / Disjoint Set',
              problems: [
                { id: 'S15-5-1', title: 'MST theory', difficulty: 'Easy' },
                { id: 'S15-5-2', title: 'Prim\'s Algorithm', difficulty: 'Hard' },
                { id: 'S15-5-3', title: 'Disjoint Set', difficulty: 'Hard' },
                { id: 'S15-5-4', title: 'Find the MST weight (Kruskal)', difficulty: 'Hard' },
                { id: 'S15-5-5', title: 'Number of operations to make network connected', difficulty: 'Hard' },
                { id: 'S15-5-6', title: 'Most stones removed with same row or column', difficulty: 'Medium' },
                { id: 'S15-5-7', title: 'Accounts merge', difficulty: 'Hard' },
                { id: 'S15-5-8', title: 'Number of islands II', difficulty: 'Hard' },
                { id: 'S15-5-9', title: 'Making a large island', difficulty: 'Hard' },
                { id: 'S15-5-10', title: 'Swim in Rising Water', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S15-6',
              name: 'Other Algorithms',
              problems: [
                { id: 'S15-6-1', title: 'Bridges in graph', difficulty: 'Hard' },
                { id: 'S15-6-2', title: 'Articulation point in graph', difficulty: 'Hard' },
                { id: 'S15-6-3', title: 'Kosaraju\'s algorithm', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 16 — DYNAMIC PROGRAMMING (55 problems)
        // ─────────────────────────────────────────
        {
          id: 'S16',
          name: 'Step 16 — Dynamic Programming [Patterns and Problems]',
          totalProblems: 55,
          subsections: [
            {
              id: 'S16-1',
              name: 'Introduction to DP',
              problems: [
                { id: 'S16-1-1', title: 'Introduction to DP', difficulty: 'Easy' }
              ]
            },
            {
              id: 'S16-2',
              name: '1D DP',
              problems: [
                { id: 'S16-2-1', title: 'Climbing stairs', difficulty: 'Medium' },
                { id: 'S16-2-2', title: 'Frog Jump', difficulty: 'Medium' },
                { id: 'S16-2-3', title: 'Frog jump with K distances', difficulty: 'Medium' },
                { id: 'S16-2-4', title: 'Maximum sum of non adjacent elements', difficulty: 'Medium' },
                { id: 'S16-2-5', title: 'House robber', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S16-3',
              name: '2D/3D DP and DP on Grids',
              problems: [
                { id: 'S16-3-1', title: 'Ninja\'s training', difficulty: 'Medium' },
                { id: 'S16-3-2', title: 'Grid Unique Paths', difficulty: 'Medium' },
                { id: 'S16-3-3', title: 'Unique paths II', difficulty: 'Medium' },
                { id: 'S16-3-4', title: 'Minimum Falling Path Sum', difficulty: 'Medium' },
                { id: 'S16-3-5', title: 'Triangle', difficulty: 'Medium' },
                { id: 'S16-3-6', title: 'Ninja and his Friends', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S16-4',
              name: 'DP on Subsequences',
              problems: [
                { id: 'S16-4-1', title: 'Subset sum equal to target', difficulty: 'Hard' },
                { id: 'S16-4-2', title: 'Partition equal subset sum', difficulty: 'Hard' },
                { id: 'S16-4-3', title: 'Partition a set into two subsets with minimum absolute sum difference', difficulty: 'Hard' },
                { id: 'S16-4-4', title: 'Count subsets with sum K', difficulty: 'Hard' },
                { id: 'S16-4-5', title: 'Count partitions with given difference', difficulty: 'Hard' },
                { id: 'S16-4-6', title: 'Assign Cookies (DP)', difficulty: 'Easy' },
                { id: 'S16-4-7', title: 'Minimum Coins', difficulty: 'Hard' },
                { id: 'S16-4-8', title: 'Target sum', difficulty: 'Hard' },
                { id: 'S16-4-9', title: 'Coin Change 2', difficulty: 'Hard' },
                { id: 'S16-4-10', title: 'Unbounded knapsack', difficulty: 'Hard' },
                { id: 'S16-4-11', title: 'Rod Cutting Problem', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S16-5',
              name: 'DP on Strings',
              problems: [
                { id: 'S16-5-1', title: 'Longest common subsequence', difficulty: 'Hard' },
                { id: 'S16-5-2', title: 'Print Longest Common Subsequence', difficulty: 'Hard' },
                { id: 'S16-5-3', title: 'Longest common substring', difficulty: 'Hard' },
                { id: 'S16-5-4', title: 'Longest palindromic subsequence', difficulty: 'Hard' },
                { id: 'S16-5-5', title: 'Minimum insertions to make string palindrome', difficulty: 'Hard' },
                { id: 'S16-5-6', title: 'Minimum insertions or deletions to convert string A to B', difficulty: 'Hard' },
                { id: 'S16-5-7', title: 'Shortest common supersequence', difficulty: 'Hard' },
                { id: 'S16-5-8', title: 'Distinct subsequences', difficulty: 'Hard' },
                { id: 'S16-5-9', title: 'Edit distance', difficulty: 'Hard' },
                { id: 'S16-5-10', title: 'Wildcard matching', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S16-6',
              name: 'DP on Stocks',
              problems: [
                { id: 'S16-6-1', title: 'Best time to buy and sell stock', difficulty: 'Medium' },
                { id: 'S16-6-2', title: 'Best time to buy and sell stock II', difficulty: 'Medium' },
                { id: 'S16-6-3', title: 'Best time to buy and sell stock III', difficulty: 'Medium' },
                { id: 'S16-6-4', title: 'Best time to buy and sell stock IV', difficulty: 'Medium' },
                { id: 'S16-6-5', title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium' },
                { id: 'S16-6-6', title: 'Best time to buy and sell stock with transaction fees', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S16-7',
              name: 'DP on LIS',
              problems: [
                { id: 'S16-7-1', title: 'Longest Increasing Subsequence', difficulty: 'Medium' },
                { id: 'S16-7-2', title: 'Print Longest Increasing Subsequence', difficulty: 'Medium' },
                { id: 'S16-7-3', title: 'Longest Increasing Subsequence (Binary Search)', difficulty: 'Medium' },
                { id: 'S16-7-4', title: 'Largest Divisible Subset', difficulty: 'Medium' },
                { id: 'S16-7-5', title: 'Longest String Chain', difficulty: 'Medium' },
                { id: 'S16-7-6', title: 'Longest Bitonic Subsequence', difficulty: 'Medium' },
                { id: 'S16-7-7', title: 'Number of Longest Increasing Subsequences', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S16-8',
              name: 'MCM DP / Partition DP',
              problems: [
                { id: 'S16-8-1', title: 'Matrix chain multiplication', difficulty: 'Hard' },
                { id: 'S16-8-2', title: 'Matrix Chain Multiplication | Bottom-Up', difficulty: 'Hard' },
                { id: 'S16-8-3', title: 'Minimum cost to cut the stick', difficulty: 'Hard' },
                { id: 'S16-8-4', title: 'Burst balloons', difficulty: 'Hard' },
                { id: 'S16-8-5', title: 'Different Ways to Evaluate a Boolean Expression', difficulty: 'Medium' },
                { id: 'S16-8-6', title: 'Palindrome partitioning II', difficulty: 'Hard' },
                { id: 'S16-8-7', title: 'Partition Array for Maximum Sum', difficulty: 'Medium' }
              ]
            },
            {
              id: 'S16-9',
              name: 'DP on Squares',
              problems: [
                { id: 'S16-9-1', title: 'Maximum Rectangle Area with all 1\'s', difficulty: 'Hard' },
                { id: 'S16-9-2', title: 'Count Square Submatrices with All Ones', difficulty: 'Easy' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 17 — TRIES (7 problems)
        // ─────────────────────────────────────────
        {
          id: 'S17',
          name: 'Step 17 — Tries',
          totalProblems: 7,
          subsections: [
            {
              id: 'S17-1',
              name: 'Theory',
              problems: [
                { id: 'S17-1-1', title: 'Trie Implementation and Operations', difficulty: 'Hard' }
              ]
            },
            {
              id: 'S17-2',
              name: 'Problems',
              problems: [
                { id: 'S17-2-1', title: 'Trie Implementation and Advanced Operations', difficulty: 'Hard' },
                { id: 'S17-2-2', title: 'Longest Word with All Prefixes', difficulty: 'Medium' },
                { id: 'S17-2-3', title: 'Number of distinct substrings in a string', difficulty: 'Medium' },
                { id: 'S17-2-4', title: 'Bit PreRequisites for TRIE Problems', difficulty: 'Easy' },
                { id: 'S17-2-5', title: 'Maximum XOR of two numbers in an array', difficulty: 'Hard' },
                { id: 'S17-2-6', title: 'Maximum Xor with an element from an array', difficulty: 'Hard' }
              ]
            }
          ]
        },

        // ─────────────────────────────────────────
        // STEP 18 — STRINGS HARD (9 problems)
        // ─────────────────────────────────────────
        {
          id: 'S18',
          name: 'Step 18 — Strings [Hard Problems]',
          totalProblems: 9,
          subsections: [
            {
              id: 'S18-1',
              name: 'Hard String Problems',
              problems: [
                { id: 'S18-1-1', title: 'Minimum number of bracket reversals to make expression balanced', difficulty: 'Hard' },
                { id: 'S18-1-2', title: 'Count and say', difficulty: 'Hard' },
                { id: 'S18-1-3', title: 'Hashing In Strings | Theory', difficulty: 'Easy' },
                { id: 'S18-1-4', title: 'Rabin Karp Algorithm', difficulty: 'Hard' },
                { id: 'S18-1-5', title: 'Z function', difficulty: 'Hard' },
                { id: 'S18-1-6', title: 'KMP Algorithm / LPS array', difficulty: 'Hard' },
                { id: 'S18-1-7', title: 'Shortest Palindrome', difficulty: 'Hard' },
                { id: 'S18-1-8', title: 'Longest happy prefix', difficulty: 'Hard' },
                { id: 'S18-1-9', title: 'Count Palindromic Subsequences', difficulty: 'Medium' }
              ]
            }
          ]
        }

      ] // end sections
    },
    {
      id: 'PYTHON',
      number: 2,
      name: 'Python for Backend',
      tagline: 'Core language for everything you build.',
      color: '#7C3AED',
      bg: '#F5F0FF',
      duration: '3 weeks',
      durationWeeks: 3,
      unlockCondition: 'DSA phase 60% complete (150 problems)',
      unlockAfter: 'DSA',
      unlockAtPercent: 60,
      resource: 'CampusX Python for AI + Fluent Python',
      sections: [
        {
          id: 'PY-1',
          name: 'Core Python',
          topics: [
            { id: 'PY-1-1', title: 'Data Structures, OOP, Generators' },
            { id: 'PY-1-2', title: 'File IO, Error Handling, Modules' },
            { id: 'PY-1-3', title: 'Async + Decorators' }
          ]
        },
        {
          id: 'PY-2',
          name: 'Python for APIs',
          topics: [
            { id: 'PY-2-1', title: 'FastAPI fundamentals' },
            { id: 'PY-2-2', title: 'Pydantic + validation' },
            { id: 'PY-2-3', title: 'Auth + middleware' }
          ]
        }
      ]
    },
    {
      id: 'BACKEND',
      number: 3,
      name: 'Backend Engineering',
      tagline: 'Build systems that scale.',
      color: '#1A6B4A',
      bg: '#F0FDF4',
      duration: '6 weeks',
      durationWeeks: 6,
      unlockCondition: 'Python phase complete',
      unlockAfter: 'PYTHON',
      unlockAtPercent: 100,
      resource: 'Chai aur Backend — Hitesh Choudhary',
      sections: [
        {
          id: 'BE-1',
          name: 'APIs & REST',
          topics: [
            { id: 'BE-1-1', title: 'REST principles, versioning, auth' },
            { id: 'BE-1-2', title: 'Rate limiting, caching, pagination' },
            { id: 'BE-1-3', title: 'GraphQL basics' }
          ]
        },
        {
          id: 'BE-2',
          name: 'Databases',
          topics: [
            { id: 'BE-2-1', title: 'PostgreSQL + advanced SQL' },
            { id: 'BE-2-2', title: 'Redis for caching' },
            { id: 'BE-2-3', title: 'MongoDB basics' },
            { id: 'BE-2-4', title: 'Database design patterns' }
          ]
        },
        {
          id: 'BE-3',
          name: 'System Internals',
          topics: [
            { id: 'BE-3-1', title: 'Concurrency + threading' },
            { id: 'BE-3-2', title: 'Message queues (Kafka/RabbitMQ)' },
            { id: 'BE-3-3', title: 'WebSockets + real-time' }
          ]
        }
      ]
    },
    {
      id: 'SYSDESIGN',
      number: 4,
      name: 'System Design',
      tagline: 'Think like a senior engineer.',
      color: '#E07B39',
      bg: '#FFF0E6',
      duration: '4 weeks',
      durationWeeks: 4,
      unlockCondition: 'Backend phase complete',
      unlockAfter: 'BACKEND',
      unlockAtPercent: 100,
      resource: 'Alex Xu Vol 1 + Gaurav Sen YouTube',
      sections: [
        {
          id: 'SD-1',
          name: 'Core Concepts',
          topics: [
            { id: 'SD-1-1', title: 'Scalability, Load Balancing, CDN' },
            { id: 'SD-1-2', title: 'CAP Theorem, consistency models' },
            { id: 'SD-1-3', title: 'Caching strategies' }
          ]
        },
        {
          id: 'SD-2',
          name: 'Classic Designs',
          topics: [
            { id: 'SD-2-1', title: 'Design URL shortener' },
            { id: 'SD-2-2', title: 'Design Twitter/Instagram feed' },
            { id: 'SD-2-3', title: 'Design Uber/Google Maps' },
            { id: 'SD-2-4', title: 'Design WhatsApp' },
            { id: 'SD-2-5', title: 'Design YouTube' }
          ]
        }
      ]
    },
    {
      id: 'LLD',
      number: 5,
      name: 'Low Level Design',
      tagline: 'Write code that architects are proud of.',
      color: '#C0392B',
      bg: '#FEF2F2',
      duration: '3 weeks',
      durationWeeks: 3,
      unlockCondition: 'System Design 50% complete',
      unlockAfter: 'SYSDESIGN',
      unlockAtPercent: 50,
      resource: 'Concept + Coding YouTube + NeetCode',
      sections: [
        {
          id: 'LLD-1',
          name: 'Design Patterns',
          topics: [
            { id: 'LLD-1-1', title: 'SOLID principles' },
            { id: 'LLD-1-2', title: 'Creational patterns' },
            { id: 'LLD-1-3', title: 'Behavioral patterns' }
          ]
        },
        {
          id: 'LLD-2',
          name: 'Classic LLD',
          topics: [
            { id: 'LLD-2-1', title: 'Design Parking Lot' },
            { id: 'LLD-2-2', title: 'Design Snake and Ladder' },
            { id: 'LLD-2-3', title: 'Design ATM Machine' },
            { id: 'LLD-2-4', title: 'Design Library System' }
          ]
        }
      ]
    },
    {
      id: 'PROJECTS',
      number: 6,
      name: 'SDE Projects',
      tagline: 'Ship 3 projects that prove everything.',
      color: '#D97706',
      bg: '#FFFBEB',
      duration: '4 weeks',
      durationWeeks: 4,
      unlockCondition: 'LLD phase complete',
      unlockAfter: 'LLD',
      unlockAtPercent: 100,
      resource: 'GitHub + personal builds',
      sections: [
        {
          id: 'PROJ-1',
          name: 'Project 1 — URL Shortener API',
          topics: [
            { id: 'PROJ-1-1', title: 'FastAPI + PostgreSQL + Redis' },
            { id: 'PROJ-1-2', title: 'Auth, rate limiting, analytics' },
            { id: 'PROJ-1-3', title: 'Deploy to Railway / Render' }
          ]
        },
        {
          id: 'PROJ-2',
          name: 'Project 2 — Real-time Chat API',
          topics: [
            { id: 'PROJ-2-1', title: 'WebSocket server, rooms, presence' },
            { id: 'PROJ-2-2', title: 'Message persistence, Redis pub/sub' },
            { id: 'PROJ-2-3', title: 'Deploy + load test' }
          ]
        },
        {
          id: 'PROJ-3',
          name: 'Project 3 — PLAYER ONE API',
          topics: [
            { id: 'PROJ-3-1', title: 'Move Supabase logic to own backend' },
            { id: 'PROJ-3-2', title: 'Add endpoints, auth, caching' },
            { id: 'PROJ-3-3', title: 'Document the API' }
          ]
        }
      ]
    }
  ],

  placement: {
    salaryTarget: '12-20 LPA',
    targetRoles: ['SDE-1', 'Backend Engineer', 'Full Stack Engineer'],
    targetCompanies: [
      { name: 'Razorpay', type: 'Fintech', priority: 'High', salary: '15-20 LPA' },
      { name: 'Zepto', type: 'Quick Commerce', priority: 'High', salary: '12-18 LPA' },
      { name: 'Meesho', type: 'E-Commerce', priority: 'High', salary: '12-18 LPA' },
      { name: 'Groww', type: 'Fintech', priority: 'High', salary: '12-18 LPA' },
      { name: 'CRED', type: 'Fintech', priority: 'Medium', salary: '15-22 LPA' },
      { name: 'Swiggy', type: 'Consumer Tech', priority: 'Medium', salary: '12-18 LPA' },
      { name: 'Walmart Labs', type: 'MNC', priority: 'Medium', salary: '15-22 LPA' },
      { name: 'Startups (YC/Sequoia)', type: 'Startup', priority: 'High', salary: '10-18 LPA' }
    ]
  }
}

export function getCurrentPhase(progress, dsaSolved) {
  const phases = SDE_TRACK_DATA.phases
  
  // DSA always first — check progress
  const dsaPercent = Math.min(100, 
    Math.floor((dsaSolved / SDE_TRACK_DATA.dsaTarget) * 100)
  )
  if (dsaPercent < 60) return { phase: phases[0], locked: false }
  
  for (let i = 1; i < phases.length; i++) {
    const phase = phases[i]
    const prevPhase = phases[i - 1]
    const prevProgress = getPhaseProgress(prevPhase.id, progress)
    
    if (prevProgress < (phase.unlockAtPercent || 100)) {
      return { phase: prevPhase, locked: false }
    }
  }
  
  return { phase: phases[phases.length - 1], locked: false }
}

export function getAllDsaTopics(phase) {
  if (!phase || !phase.sections) return []
  return phase.sections.flatMap(section =>
    section.subsections
      ? section.subsections.flatMap(sub => sub.problems || [])
      : section.problems || []
  )
}

export function getPhaseProgress(phaseId, progress) {
  const phase = SDE_TRACK_DATA.phases.find(p => p.id === phaseId)
  if (!phase) return 0
  
  const allTopics = phase.id === 'DSA'
    ? getAllDsaTopics(phase)
    : phase.sections.flatMap(s => s.topics || [])
  
  const done = allTopics.filter(t => progress[t.id]?.done).length
  return allTopics.length > 0 
    ? Math.floor((done / allTopics.length) * 100) : 0
}

export function getDsaTotalCount(phase) {
  return getAllDsaTopics(phase).length
}
