# Neis-Meal
  Neis 급식 파싱 모듈

```js
var neis = require('neis-meal');

// 데이터 기준일, 학교코드(경기자동차고), 학교분류
neis.setOptions(2018, 9, 30, "J100000859", neis.HIGH_SCHOOL);

neis.getMonthlyMeal()
        .then(v => console.log('Monthly Meal: ' + v));

neis.getWeeklyMeal(neis.MEAL_ALL)
        .then(v => console.log('Weekly Meal: ' + v));
```

## Installation

```bash
$ npm install neis-meal
```