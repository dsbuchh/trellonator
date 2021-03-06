const defaultFilename = 'jump-completed.json';

window.onload = function() {
	let fileControl = document.querySelector('#filename');
	let filenameURL = '';
	
	const urlParams = new URLSearchParams(window.location.search);
	filenameURL = urlParams.get('filename');
	
	if(!filenameURL){
		filenameURL = defaultFilename;
	}

	fileControl.value = filenameURL;
	loadTrelloCards(filenameURL);

};

function loadTrelloCards(url){
	let memberListMap = {};
	let trelloCardsJSON;
	let cardList = [];

	console.log('loading file:' + url);

	if(!url || url.search('.json') <= 0){
		renderError(url, 'Invalid filename');
		return -1;
	}

	fetch(url).then(function(response){
		response.json().then(function(json) {
			trelloCardsJSON = json;
			renderHeaderHTML(trelloCardsJSON);
			buildMemberMap(trelloCardsJSON.members);
			buildCardList(trelloCardsJSON.cards);
			renderCardTableHTML();
		}).catch(function(err) {
			console.log('Fetch problem: ' + url + ' ' +  err.message);
			renderError(url, err.message);
		});
	});
	

	function renderError(url, errMessage){
		let hdr = document.querySelector('#trelloboardHdr');
		let headerInfo = [];
		headerInfo.push('<div class = "error">');
		headerInfo.push('<h1>');
		headerInfo.push('Error loading json file:');
		headerInfo.push(url);
		headerInfo.push('</h1>');
		headerInfo.push('<p>');
		headerInfo.push(errMessage);
		headerInfo.push('</p>');
		headerInfo.push('</div>');
		hdr.innerHTML = headerInfo.join('');
	}


	function renderHeaderHTML(board){
		let hdr = document.querySelector('#trelloboardHdr');
		let headerInfo = [];
		
		headerInfo.push("<h1>");
		headerInfo.push("Trello Board: ");
		headerInfo.push(board.name);
		headerInfo.push("</h1>");
		headerInfo.push("<p class='italic'>");
		headerInfo.push("Board Last Updated: ");
		headerInfo.push(board.dateLastActivity.slice(0,16));
		headerInfo.push("</p>");

		hdr.innerHTML = headerInfo.join('');
	}

	function buildCardList(cards){
		const templateLongAlias = 'DA2 Report Alias:';
		const templateLongProg = 'CCL Program Name:';
		const templateLongApp = 'Built With Application:';
		const templateShortAlias = 'Alias:';
		const templateShortProg = 'Program:';
		const templateShortApp = 'Application:';
		const templateShortDist = 'Distribution:';

		
		for(var i = 0; i < cards.length; i++){
			var card = {
				cardName: '',
				DA2Name: '',
				CCLProgName: '',
				application: '',
				owner: '',
				lastUpdate: '',
				cardDesc: '',
				cardDescParseText: ''
			}
	
			if(!cards[i].closed){
				card.cardName = cards[i].name
				card.cardDesc = cards[i].desc
				card.cardDescParseText = card.cardDesc.replace(templateLongAlias, templateShortAlias)
										.replace(templateLongProg, templateShortProg)
										.replace(templateLongApp, templateShortApp);

				card.DA2Name = parseField(card.cardDescParseText, templateShortAlias, templateShortProg);
				card.CCLProgName = parseField(card.cardDescParseText, templateShortProg, templateShortApp);
				card.application = parseField(card.cardDescParseText, templateShortApp, templateShortDist);

				card.owner = cards[i].idMembers[0] ? memberListMap[cards[i].idMembers[0]] : '';
				card.lastUpdate = cards[i].dateLastActivity;
				cardList.push(card);
			}
		}

		cardList.sort(function (a, b){
			if(a.lastUpdate < b.lastUpdate)
				return -1
			else if(a.lastUpdate > b.lastUpdate)
				return 1
			else
				return 0
		});
	}

	function renderCardTableHTML(){
		var resultSect = document.querySelector('#trellooutput');
		var resultHTML = [];
		resultHTML.push('<tr>');
		resultHTML.push('<th>' + 'Card Name' + '</th>');
		resultHTML.push('<th>' + 'DA2 Alias' + '</th>');
		resultHTML.push('<th>' + 'CCL Name' + '</th>');
		resultHTML.push('<th>' + 'Application' + '</th>');
		resultHTML.push('<th>' + 'Last Update' + '</th>');
		resultHTML.push('<th>' + 'Owner' + '</th>');
		resultHTML.push('<th>' + 'Report Text' + '</th>');
		resultHTML.push('</tr>');

		for(var i = cardList.length-1; i >= 0; i--){
			resultHTML.push('<tr>');
			resultHTML.push('<td>' + cardList[i].cardName + '</td>');
			resultHTML.push('<td>' + cardList[i].DA2Name + '</td>');
			resultHTML.push('<td>' + cardList[i].CCLProgName + '</td>');		
			resultHTML.push('<td>' + cardList[i].application + '</td>');		
			resultHTML.push('<td>' + cardList[i].lastUpdate.slice(0,10) + '</td>');		
			resultHTML.push('<td>' + cardList[i].owner + '</td>');
			resultHTML.push('<td>' + cardList[i].cardDesc + '</td>');
			resultHTML.push('</tr>');
		}

		resultSect.innerHTML = resultHTML.join('');
	}

	function parseField(mystr, startDelim, endDelim){
		var startPos = mystr.search(startDelim) + startDelim.length;
		var endPos = mystr.search(endDelim);
		return mystr.slice(startPos, endPos)
	}


	function buildMemberMap(members){
		for(var i = 0; i < members.length; i++){
			memberListMap[members[i].id] = members[i].username;
		}
	}



};

