var canvas = document.getElementById('chessBoard');
var ctx = canvas.getContext('2d');

var blkWidth = 40, blkSize = 15, totPos = 15 * 15;
var bgCol = '#F8CE9D';

//[0, t)
function RandInt(t) {
	return Math.floor(Math.random() * t);
}

var Map = new Array(), isDot = new Array();
for (var i = 1; i <= blkSize; ++i) {
	Map[i] = new Array();
	isDot[i] = new Array();
}

for (var i = 1; i <= blkSize; ++i) {
	for (var j = 1; j <= blkSize; ++j) {
		isDot[i][j] = false;
	}
}
isDot[4][4] = isDot[12][4] = isDot[8][8] = isDot[4][12] = isDot[12][12] = true;

//dir[0]:正方向  dir[1]:斜方向
var dirX = new Array(), dirY = new Array();
dirX[0] = new Array(0, 1, 0, -1), dirY[0] = new Array(1, 0, -1, 0);
dirX[1] = new Array(1, 1, -1, -1), dirY[1] = new Array(1, -1, -1, 1);

//存储记录
var history = new Array();
history[0] = new Array();
history[1] = new Array();
var hisTop = 0;

//当前下棋的一方  -1:none  0:White  1:Black
var playerNow = -1;

//双方  0:user  1:AI-1
var playerSet = new Array();

//当前方执子 
var nowCol;

function DrawLine(x1, y1, x2, y2, w, color) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = w;
	ctx.strokeStyle = color;
	ctx.stroke();
}

function DrawPoint(x, y, r, color) {
	ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fillStyle = color;
    ctx.fill();
}

var gmSt, btn1, btn2, btn3, btn4;
gmSt = document.getElementById('gameState');
btn1 = document.getElementById('btn-1');
btn2 = document.getElementById('btn-2');
btn3 = document.getElementById('btn-3');
btn4 = document.getElementById('btn-4');


function Initialize() {
	ctx.clearRect(0, 0, 640, 640);

	for (var i = 1; i <= 15; i++) {
		DrawLine(blkWidth, blkWidth * i, blkWidth * 15, blkWidth * i, 2, "black");
		DrawLine(blkWidth * i, blkWidth, blkWidth * i, blkWidth * 15, 2, "black");
	}

	DrawPoint(blkWidth * 4, blkWidth * 4, 6, "black");
	DrawPoint(blkWidth * 12, blkWidth * 4, 6, "black");
	DrawPoint(blkWidth * 8, blkWidth * 8, 6, "black");
	DrawPoint(blkWidth * 4, blkWidth * 12, 6, "black");
	DrawPoint(blkWidth * 12, blkWidth * 12, 6, "black");

	for (var i = 1; i <= blkSize; ++i) {
		for (var j = 1; j <= blkSize; ++j) {
			Map[i][j] = -1;
		}
	}
	playerNow = -1;
	hisTop = 0;

	gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>请选择对弈模式以开始棋局</cn><br/>Please choose a game mode to start</p>';
	btn1.style.display = "";
	btn2.style.display = "none";
	btn3.style.display = "none";
	btn4.style.display = "none";

	playerSet[0] = playerSet[1] = -1;
}

function getLocation(x, y) {
    var bbox = canvas.getBoundingClientRect();  
    return {  
    	x: (x - bbox.left) * (canvas.width / bbox.width),  
    	y: (y - bbox.top) * (canvas.height / bbox.height)  
    };  
}  

var Mx = -1, My = -1;

function Inside(x, y) {
	if (x < 1 || x > 15) return false;
	if (y < 1 || y > 15) return false;
	return true;
}

function DrawCursor(x, y, color) {
	if (!Inside(x, y) || Map[x][y] != -1) return;
	var x0, y0, xx, yy;
	x0 = blkWidth * x; y0 = blkWidth * y;
	xx = x0 - 12; yy = y0 - 12;
	ctx.beginPath();
	ctx.moveTo(xx + 5, yy);
	ctx.lineTo(xx, yy);
	ctx.lineTo(xx, yy + 5);
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.stroke();

	xx = x0 + 12; yy = y0 - 12;
	ctx.beginPath();
	ctx.moveTo(xx - 5, yy);
	ctx.lineTo(xx, yy);
	ctx.lineTo(xx, yy + 5);
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.stroke();

	xx = x0 + 12; yy = y0 + 12;
	ctx.beginPath();
	ctx.moveTo(xx - 5, yy);
	ctx.lineTo(xx, yy);
	ctx.lineTo(xx, yy - 5);
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.stroke();

	xx = x0 - 12; yy = y0 + 12;
	ctx.beginPath();
	ctx.moveTo(xx + 5, yy);
	ctx.lineTo(xx, yy);
	ctx.lineTo(xx, yy - 5);
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.stroke();
}

function getBlk(loc) {
	var x, y, nx, ny;
	x = loc.x - 20;
	y = loc.y - 20;
	nx = Math.ceil(x / blkWidth);
	ny = Math.ceil(y / blkWidth);
	return {x: nx, y: ny};
}

function SetBackGround() {
	var bgIdx = RandInt(8);
	var bgURL = "bg" + bgIdx + ".jpg";
	document.getElementById("mBody").style.backgroundImage = "url(images/" + bgURL + ")";
}

//鼠标移动事件 获取鼠标位置
canvas.onmousemove = function (e) {
	var location = getLocation(e.clientX, e.clientY);  
	var nowP = getBlk(location);
	if (nowP.x == Mx && nowP.y == My) return;
	DrawCursor(Mx, My, bgCol);
	Mx = nowP.x; My = nowP.y;
	DrawCursor(Mx, My, 'red');
};  

canvas.onmouseover = function (e) {
	var location = getLocation(e.clientX, e.clientY);  
	var nowP = getBlk(location);
	if (nowP.x == Mx && nowP.y == My) return;
	DrawCursor(Mx, My, bgCol);
	Mx = nowP.x; My = nowP.y;
	DrawCursor(Mx, My, 'red');
};

canvas.onmouseout = function (e) {
	DrawCursor(Mx, My, bgCol);
	Mx = My = -1;
};

//col: 0-White 1-Black
//type: 0-Old 1-New
function DrawPiece(x, y, col, type) {
	var img;
	if (col == 0 && type == 0) img = document.getElementById('white');
	else if (col == 0 && type == 1) img = document.getElementById('white-n');
	else if (col == 1 && type == 0) img = document.getElementById('black');
	else if (col == 1 && type == 1) img = document.getElementById('black-n');
	ctx.drawImage(img, blkWidth * x - 18, blkWidth * y - 18);
}

function RemovePiece(x, y) {
	Map[x][y] = -1;
	ctx.fillStyle = bgCol;
	ctx.fillRect(x * blkWidth - 20, y * blkWidth - 20, 40, 40);
	if (x != 1) DrawLine(x * blkWidth - 20, y * blkWidth, x * blkWidth, y * blkWidth, 2, "black");
	if (y != 1) DrawLine(x * blkWidth, y * blkWidth - 20, x * blkWidth, y * blkWidth, 2, "black");
	if (x != blkSize) DrawLine(x * blkWidth, y * blkWidth, x * blkWidth + 20, y * blkWidth, 2, "black");
	if (y != blkSize) DrawLine(x * blkWidth, y * blkWidth, x * blkWidth, y * blkWidth + 20, 2, "black");
	if (isDot[x][y]) DrawPoint(blkWidth * x, blkWidth * y, 6, "black");
}

var cntDir = new Array();
for (var i = 0; i < 2; ++i) 
	cntDir[i] = new Array();

function CheckWin(x, y, prt) {
	var col = Map[x][y];
	var nx, ny;
	if (col == -1) return false;
	for (var i = 0; i < 2; ++i) {
		for (var j = 0; j < 4; ++j) {
			cntDir[i][j] = 0;
			nx = x + dirX[i][j]; ny = y + dirY[i][j];
			while (Inside(nx, ny) && Map[nx][ny] == col) {
				++cntDir[i][j];
				nx += dirX[i][j]; ny += dirY[i][j];
			}
		}
		for (var j = 0; j < 2; ++j) {
			if (cntDir[i][j] + cntDir[i][j + 2] >= 4) {
				if (prt) {
					nx = x; ny = y;
					for (var k = 1; k <= cntDir[i][j]; ++k) {
						nx += dirX[i][j]; ny += dirY[i][j];
						DrawPiece(nx, ny, col, 1);
					}
					nx = x; ny = y;
					for (var k = 1; k <= cntDir[i][j + 2]; ++k) {
						nx += dirX[i][j + 2]; ny += dirY[i][j + 2];
						DrawPiece(nx, ny, col, 1);
					}
				}
				return true;
			}
		} 
	}
	return false;
}

function GameEnd(col) {
	var cnCol, enCol;
	if (nowCol == 0) {
		cnCol = '白棋';
		enCol = 'White';
	}
	else {
		cnCol = '黑棋';
		enCol = 'Black';
	}
	gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>' + cnCol + '获胜</cn> <br/> ' + enCol + ' is winner.</p>';
	playerNow = -1;
}

//function Solve(col);

function SetPiece(x, y, col) {
	Map[x][y] = col;
	if (CheckWin(x, y, true)) {
		GameEnd(col);
		return;
	}
	history[++hisTop] = {x : x, y : y};
	playerNow ^= 1;
	nowCol ^= 1;
	if (hisTop == totPos) {
		gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>棋盘已满</cn> <br/> The chessboard is full.</p>';
		return;
	}
	var cnCol, enCol;
	if (nowCol == 0) {
		cnCol = '白棋';
		enCol = 'White';
	}
	else {
		cnCol = '黑棋';
		enCol = 'Black';
	}
	gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>当前下棋方 : ' + cnCol + '</cn> &nbsp;&nbsp; (The one to move now : ' + enCol + ')<br/><cn>当前步数 : ' + hisTop + '</cn> &nbsp;&nbsp; (Steps now : ' + hisTop + ')</p>';	
}

/********************************************* AI ***********************************************/

var V = new Array(), CM = new Array();
for (var i = 1; i <= blkSize; ++i) {
	V[i] = new Array();
	CM[i] = new Array(); 
}

var minX, maxX, minY, maxY;

var cntDir0 = new Array(), cntDir1 = new Array(), cntLen0 = new Array(), cntLen1 = new Array(), free0 = new Array(), free1 = new Array();
for (var i = 0; i < 2; ++i) {
	cntDir0[i] = new Array();
	cntDir1[i] = new Array();
	free0[i] = new Array();
	free1[i] = new Array();
}
for (var i = 0; i <= 4; ++i) {
	cntLen0[i] = new Array();
	cntLen1[i] = new Array();
}

function GetValue(x, y, col) {
	var ret = 0, len0, len1, free00, free11;
	for (var i = 0; i <= 4; ++i) {
		for (var j = 0; j <= 2; ++j) {
			cntLen0[i][j] = cntLen1[i][j] = 0;
		}
	}
	for (var i = 0; i < 2; ++i) {
		for (var j = 0; j < 4; ++j) {
			cntDir0[i][j] = cntDir1[i][j] = 0;

			nx = x + dirX[i][j]; ny = y + dirY[i][j];
			while (Inside(nx, ny) && CM[nx][ny] == col) {
				++cntDir0[i][j];
				nx += dirX[i][j]; ny += dirY[i][j];
			}
			if (Inside(nx, ny) && CM[nx][ny] == -1) free0[i][j] = 1;
			else free0[i][j] = 0;

			nx = x + dirX[i][j]; ny = y + dirY[i][j];
			while (Inside(nx, ny) && CM[nx][ny] == (col ^ 1)) {
				++cntDir1[i][j];
				nx += dirX[i][j]; ny += dirY[i][j];
			}
			if (Inside(nx, ny) && CM[nx][ny] == -1) free1[i][j] = 1;
			else free1[i][j] = 0;
		}
		for (var j = 0; j < 2; ++j) {
			len0 = cntDir0[i][j] + cntDir0[i][j + 2];
			len1 = cntDir1[i][j] + cntDir1[i][j + 2];
			len0 = Math.min(len0, 4);
			len1 = Math.min(len1, 4);
			free00 = free11 = 0;
			if (free0[i][j]) ++free00;
			if (free0[i][j + 2]) ++free00;
			if (free1[i][j]) ++free11;
			if (free1[i][j + 2]) ++free11;
			++cntLen0[len0][free00];
			++cntLen1[len1][free11];
		} 
	}
	ret = 0;
	if (cntLen0[4][0] + cntLen0[4][1] + cntLen0[4][2] > 0) 
		ret += 1000000;
	if (cntLen1[4][0] + cntLen1[4][1] + cntLen1[4][2] > 0)
		ret += 900000;

	if (cntLen0[3][2] >= 1) ret += 50000;
	if (cntLen0[3][1] >= 2 || (cntLen0[3][1] == 1 && cntLen0[2][2] > 0)) ret += 10000;
	if (cntLen0[2][2] >= 2) ret += 5000;
	if (cntLen0[2][1] == 1 && cntLen0[1][2] > 0) ret += 1000;
	if (cntLen0[3][1] == 1 && cntLen0[2][2] == 0 && cntLen0[2][1] == 0) ret += 500;
	if (cntLen0[2][2] == 1) ret += 200;
	if (cntLen0[1][2] == 2) ret += 100;
	if (cntLen0[2][1] >= 1) ret += 50;
	if (cntLen0[1][2] == 1) ret += 25;
	if (cntLen0[1][1] >= 1) ret += 10; 

	if (cntLen1[3][2] >= 1) ret += 40000;
	if (cntLen1[3][1] >= 2 || (cntLen1[3][1] == 1 && cntLen1[2][2] > 0)) ret += 9000;
	if (cntLen1[2][2] >= 2) ret += 4000;
	if (cntLen1[2][1] == 1 && cntLen1[1][2] > 0) ret += 900;
	if (cntLen1[3][1] == 1 && cntLen1[2][2] == 0 && cntLen1[2][1] == 0) ret += 400;
	if (cntLen1[2][2] == 1) ret += 180;
	if (cntLen1[1][2] == 2) ret += 90;
	if (cntLen1[2][1] >= 1) ret += 40;
	if (cntLen1[1][2] == 1) ret += 20;
	if (cntLen1[1][1] >= 1) ret += 9; 
	return ret;
}

var csSet = new Array();
var scTop = 0;

function Choose(col) {
	var ret = {x : 0, y : 0};
	if (hisTop == 0) {
		ret.x = 8 + (2 - RandInt(5));
		ret.y = 8 + (2 - RandInt(5));
		return ret;
	}
	minX = minY = blkSize + 1;
	maxX = maxY = 0; 
	for (var i = 1; i <= blkSize; ++i) {
		for (var j = 1; j <= blkSize; ++j) {
			V[i][j] = 0;
			CM[i][j] = Map[i][j];
			if (CM[i][j] != -1) {
				minX = Math.min(minX, i);
				maxX = Math.max(maxX, i);
				minY = Math.min(minY, j);
				maxY = Math.max(maxY, j);
			}
		}
	}
	minX = Math.max(minX - 3, 1);	
	minY = Math.max(minY - 3, 1);
	maxX = Math.min(maxX + 3, blkSize);
	maxY = Math.min(maxY + 3, blkSize);
	csTop = 0;
	var maxV = -1;
	for (var i = minX; i <= maxX; ++i) {
		for (var j = minY; j <= maxY; ++j) {
			if (CM[i][j] != -1) continue;
			V[i][j] = GetValue(i, j, col);
			if (V[i][j] < maxV) continue;
			if (V[i][j] > maxV) {
				maxV = V[i][j];
				csTop = 0;
			}
			csSet[++csTop] = {x : i, y : j};
		}
	}
	ret = csSet[RandInt(csTop) + 1];
	return ret;
}

function SolveAI(col) {
	for (var i = 1; i <= blkSize; ++i) {
		for (var j = 1; j <= blkSize; ++j) {
			CM[i][j] = Map[i][j];
		}
	}
	var nowP = Choose(col);
	if (hisTop > 0) DrawPiece(history[hisTop].x, history[hisTop].y, nowCol ^ 1, 0);
	DrawCursor(nowP.x, nowP.y, bgCol);
	DrawPiece(nowP.x, nowP.y, nowCol, 1);
	SetPiece(nowP.x, nowP.y, nowCol);
}

/************************************************************************************************/

canvas.onclick = function(e) {
	if (playerSet[playerNow] != 0) return; 
	var location = getLocation(e.clientX, e.clientY);  
	var nowP = getBlk(location);
	if (!Inside(nowP.x, nowP.y) || Map[nowP.x][nowP.y] != -1) return;
	if (hisTop > 0) DrawPiece(history[hisTop].x, history[hisTop].y, nowCol ^ 1, 0);
	DrawCursor(nowP.x, nowP.y, bgCol);
	DrawPiece(nowP.x, nowP.y, nowCol, 1);
	SetPiece(nowP.x, nowP.y, nowCol);
	if (playerSet[playerNow] == 1)
		SolveAI(nowCol);
}

function ChooseOrder() {
	btn1.style.display = "none";
	btn2.style.display = "";
	btn3.style.display = "none"; //
	btn4.style.display = "none"; //
	gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>请选择先手一方</cn><br/>Please decide who is to move first</p>';
}

function StartGame(pm, ord) {
	if (pm == 0)
		playerSet[0] = playerSet[1] = 0;
	else {
		playerSet[ord] = 1;
		playerSet[ord ^ 1] = 0;
	}
	btn1.style.display = "none";
	btn2.style.display = "none";
	btn3.style.display = "";
	btn4.style.display = "none";
	playerNow = 0;
	nowCol = 1;
	gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>当前下棋方 : 黑棋</cn> &nbsp;&nbsp; (The one to move now : Black)<br/><cn>当前步数 : 0</cn> &nbsp;&nbsp; (Steps now : 0)</p>';	
	if (playerSet[playerNow] == 1)
		SolveAI(nowCol);
}

function Restart() {
	btn1.style.display = "none"; //
	btn2.style.display = "none"; //
	btn3.style.display = "none";
	btn4.style.display = "";
}

function CancelRestart() {
	btn1.style.display = "none"; //
	btn2.style.display = "none"; //
	btn3.style.display = "";
	btn4.style.display = "none";	
}

function WithDraw() {
	if (hisTop == 0 || playerNow == -1 || playerSet[playerNow] != 0) return;
	var mv;
	if (playerSet[playerNow ^ 1] == 1) {
		if (hisTop < 2)	return;
		mv = history[hisTop--];
		RemovePiece(mv.x, mv.y);
		mv = history[hisTop--];
		RemovePiece(mv.x, mv.y);
		if (hisTop > 0) {
			mv = history[hisTop];
			DrawPiece(mv.x, mv.y, nowCol ^ 1, 1);
		}
	}
	else {
		mv = history[hisTop--];
		RemovePiece(mv.x, mv.y);
		if (hisTop > 0) {
			mv = history[hisTop];
			DrawPiece(mv.x, mv.y, nowCol, 1);
		}
		playerNow ^= 1;
		nowCol ^= 1;
	}
	var cnCol, enCol;
	if (nowCol == 0) {
		cnCol = '白棋';
		enCol = 'White';
	}
	else {
		cnCol = '黑棋';
		enCol = 'Black';
	}

	gmSt.innerHTML = '<p style=\"font-size:15px\"><cn>当前下棋方 : ' + cnCol + '</cn> &nbsp;&nbsp; (The one to move now : ' + enCol + ')<br/><cn>当前步数 : ' + hisTop + '</cn> &nbsp;&nbsp; (Steps now : ' + hisTop + ')</p>';	
}
