const rp = require('request-promise');

// School Types
exports.KINDERGARTEN		= '1';		// 유치원
exports.ELEMENTARY_SCHOOL	= '2';		// 초등학교
exports.MIDDLE_SCHOOL		= '3';		// 중학교
exports.HIGH_SCHOOL			= '4';		// 고등학교

// Meal Types
exports.MEAL_ALL			= '0';		// 조식, 중식, 석식 전부
exports.MEAL_BREAKFAST		= '1';		// 조식
exports.MEAL_LUNCH			= '2';		// 중식
exports.MEAL_DINNER			= '3';		// 석식

const days = ['sun', 'mon', 'tue', 'wed', 'the', 'fri', 'sat'];
let options;

const parseMeal = function() {
	if(options === undefined)
		throw new Error('setOptions()가 실행되지 않았습니다.');
	
	return rp({
		uri: 'https://stu.goe.go.kr/edusys.jsp?page=sts_m40000',		// Session 활성화
		headers: {'User-Agent': 'Request-Promise'},
		resolveWithFullResponse: true									// callback 인자를 response 객체로 함
	}).then(function(res) {
		// Cookie Set
		options["headers"]["Cookie"] = rp.cookie(res.headers['set-cookie'].join(";"));
		
		// 급식 데이터 request
		return rp(options)
			.then(function(body) {
				return body;
			})
			.catch(function(err) {
				console.log(err.message);
			});
		
	}).catch(function(err) {
		console.log(err.message);
	});
	
};

// 옵션 세팅(기준 일자, 학교 코드, 학교 분류)
exports.setOptions = function (year, month, day, schoolCode, schoolType) {
	// 에러 발생
	if(![exports.KINDERGARTEN,
			exports.ELEMENTARY_SCHOOL,
			exports.MIDDLE_SCHOOL,
			exports.HIGH_SCHOOL].includes(schoolType))
		throw new Error('schoolType이 올바르지 않습니다');
	
	
	// YYYY, MM, DD 형식으로 변환
	year = String(year);
	month = month < 10 ? '0' + String(month) : String(month);
	day = day < 10 ? '0' + String(day) : String(day);
	
	
	options = {
		method: 'POST',
		headers: {
			'User-Agent': 'Request-Promise',
			'Content-Type': 'application/json'
		},
		body: {
			"ay": year,
			"mm": month,
			"schulCode": String(schoolCode),
			"schulCrseScCode": schoolType,
			"schYmd": year + month + day,
		},
		json: true		// Automatically parses the JSON string in the response
	};
};

// uri: 'https://stu.goe.go.kr/sts_sci_md' + type +'_001.ws',
// "schMmealScCode": "2"				// 중식

// 결과 Promise 반환
exports.getWeeklyMeal = async function(mealType = exports.MEAL_ALL) {
	options['uri'] = 'https://stu.goe.go.kr/sts_sci_md01_001.ws';
	
	const mealNames = ['breakfast', 'lunch', 'dinner'];
	// const mealCodes = [exports.MEAL_BREAKFAST, exports.MEAL_LUNCH, exports.MEAL_DINNER];
	const mealCodes = [exports.MEAL_BREAKFAST, exports.MEAL_LUNCH, exports.MEAL_DINNER];
	
	const result = {};
	let dietObj = {};
	
	switch(mealType) {
		case exports.MEAL_ALL:
			
			for(let i=0; i<3; i++) {
				options['body']['schMmealScCode'] = mealCodes[i];
				const body = await parseMeal();
				
				dietObj = body['resultSVO']['weekDietList'];
				
				for(let j=0; j<days.length; j++) {
					let date = dietObj[0][days[j]].slice(0, 10);		// YYYY.MM.DD
					
					// 데이터 저장
					if(dietObj[2] !== undefined && dietObj[2][days[j]] !== ' ') {
						if(result[date] === undefined)
							
							result[date] = {};
						
						result[date][mealNames[i]] = dietObj[2][days[j]].split('<br />');
						result[date][mealNames[i]].pop();
					}
				}
			}
			break;
		case exports.MEAL_BREAKFAST:
		case exports.MEAL_LUNCH:
		case exports.MEAL_DINNER:
			options['body']['schMmealScCode'] = mealType;
			const body = await parseMeal();
			
			dietObj = body['resultSVO']['weekDietList'];
			for(let i=0; i<days.length; i++) {
				let date = dietObj[0][days[i]].slice(0, 10);		// YYYY.MM.DD
				
				// 데이터 저장
				if(dietObj[2] !== undefined && dietObj[2][days[i]] !== ' ') {
					if(result[date] === undefined)
						result[date] = {};
					
					result[date][mealNames[mealCodes.indexOf(mealType)]] = dietObj[2][days[i]].split('<br />');
					result[date][mealNames[mealCodes.indexOf(mealType)]].pop();
				}
			}
			break;
	}
	
	return result;
};

// 기준 일자가 속한 달의 급식 정보
exports.getMonthlyMeal = async function () {
	options['uri'] = 'https://stu.goe.go.kr/sts_sci_md00_001.ws';
	
	const re = new RegExp(/\[조식]<br \/>|\[중식]<br \/>|\[석식]<br \/>/, 'g');		// 한 문자열 내에 섞여있는 조식, 중식, 석식을 구분하기 위한 정규표현식
	
	const body = await parseMeal();
	
	let dietObj = body['resultSVO']['mthDietList'];
	const result = {};
	
	for(let v of dietObj) {
		for(let i=0; i<days.length; i++) {
			if(v[days[i]] === null)
				continue;
			
			let date = options.body.ay + '.' + options.body.mm + '.';
			
			let mealArr = v[days[i]].split(re);
			let mealTypes = v[days[i]].match(re);
			
			mealArr[0] = mealArr[0].replace('<br />', '');
			
			// 날짜 추출
			date += mealArr[0] < 10 ? '0' + mealArr.shift() : mealArr.shift();
			
			if(mealTypes !== null) {
				for(let j=0; j<mealTypes.length; j++) {
					let mealType = mealTypes[j];
					
					switch(mealType) {
						case '[조식]<br />':
							mealType = 'breakfast';
							break;
						case '[중식]<br />':
							mealType = 'lunch';
							break;
						case '[석식]<br />':
							mealType = 'dinner';
							break;
					}
					
					if(result[date] === undefined)
						result[date] = {};
					
					result[date][mealType] = mealArr[j].split('<br />');
				}
			}
		}
	}
	return result;
};
