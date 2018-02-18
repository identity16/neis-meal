# Neis-Meal
  Neis 급식 파싱 모듈

## Examples
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

## Documentation
### setOptions(year, month, day, schoolCode, schoolType)
파싱을 위한 옵션 세팅. 가장 먼저 실행되어야 함.

- 매개변수

| Parameter | Description |
|:---------:|-------------|
|year, month, day |얻고 싶은 데이터의 기준 날짜|
|schoolCode |학교 코드([링크](https://www.meatwatch.go.kr/biz/bm/sel/schoolListPopup.do)에서 확인 가능)|
|schoolType |학교 분류(유치원, 초등학교, 중학교, 고등학교)<br>`neis.KINDERGARTEN`, `neis.ELEMENTARY_SCHOOL`, `neis.MIDDLE_SCHOOL`, `neis.HIGH_SCHOOL`|

### getWeeklyMeal(mealType)
기준 일자가 속한 주의 급식 정보를 가져옴.

- 매개변수

| Parameter | Description |
|:---------:|-------------|
|mealType   |파싱할 식사의 종류(전부, 조식, 중식, 석식)<br>`neis.MEAL_ALL`, `neis.MEAL_BREAKFAST`, `neis.MEAL_LUNCH`, `neis.MEAL_DINNER`<br>Default= `neis.MEAL_ALL`|

- 리턴 값 : Promise를 반환. `.then()`으로 넘어가는 값은 다음과 같다.
```js
{
  'YYYY.MM.DD': {
      // 조식(뿐만 아니라 특정 식사)이 없는 경우 아예 할당되지 않음.
      'lunch': ['menu1', 'menu2', ...],
      'dinner': ['menu1', 'menu2', ...]
  },
  ...
}
```

### getMonthlyMeal()
기준 일자가 속한 달의 급식 정보를 가져옴.

- 매개변수 X. (Neis 링크에서 따로 넘길 수 있는 파라미터가 없기 때문, 무조건 모든 식사 정보를 다 가져옴)

- 리턴 값 : Promise를 반환. `.then()`으로 넘어가는 값은 다음과 같다.
```js
// Weekly와 동일
{
  'YYYY.MM.DD': {
      // 조식(뿐만 아니라 특정 식사)이 없는 경우 아예 할당되지 않음.
      'lunch': ['menu1', 'menu2', ...],
      'dinner': ['menu1', 'menu2', ...]
  },
  ...
}
```
