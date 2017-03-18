export default {
  source: '#N canvas 614 276 450 301 10;\r\n#X obj 69 290 dac~;\r\n#X obj 134 56 catch~ outR;\r\n#X obj 40 58 catch~ outL;\r\n#X obj 43 227 *~;\r\n#X obj 132 229 *~;\r\n#X obj 366 23 r vol;\r\n#X obj 366 76 *;\r\n#X obj 366 49 t f f;\r\n#X obj 366 104 sig~;\r\n#X obj 366 130 lop~ 2;\r\n#X obj 38 133 clip~ -1 1;\r\n#X obj 127 133 clip~ -1 1;\r\n#X obj 41 88 *~ 0.25;\r\n#X obj 138 87 *~ 0.25;\r\n#X connect 1 0 13 0;\r\n#X connect 2 0 12 0;\r\n#X connect 3 0 0 0;\r\n#X connect 4 0 0 1;\r\n#X connect 5 0 7 0;\r\n#X connect 6 0 8 0;\r\n#X connect 7 0 6 0;\r\n#X connect 7 1 6 1;\r\n#X connect 8 0 9 0;\r\n#X connect 9 0 4 1;\r\n#X connect 9 0 3 1;\r\n#X connect 10 0 3 0;\r\n#X connect 11 0 4 0;\r\n#X connect 12 0 10 0;\r\n#X connect 13 0 11 0;\r\n',
  abstractions: []
}
