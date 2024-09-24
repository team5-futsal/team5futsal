/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { doDisplay, handleApiButtonClick } from './utils.js';
import {
    getAccountAll,
    getAccountInfo,
    updateAccount,
    deleteAccount,
    logoutAccount,
    getTeam,
    getUserTeam,
    excludeTeam,
    excludeTeamAll,
    updateTeam,
    getPlayerDetail,
    getPlayers,
    runCustomGame,
    matchGame,
} from './api.js';

// 카테고리 html이 로드되고 js가 로드되었을 때 실행하도록 함.
// 1. 생성된 accessToken을 받아오기 위해 선언함.
window.addEventListener('DOMContentLoaded', () => {
    if (getAccessToken !== null) {
        setAccessToken(localStorage.getItem('accessToken'));
        localStorage.clear();
    }

    // 카테고리에 있는 각 API 버튼에 이벤트 리스너 추가
    document.querySelectorAll('[type="apiForm"] button').forEach(button => {
        button.addEventListener('click', handleApiButtonClick);
    });

    document.body.addEventListener('click', function (event) {
        // 클릭된 요소의 ID가 'ResSendBtn'으로 끝나는지 확인
        if (event.target && event.target.id.endsWith('ResSendBtn')) {
            const apiResDiv = document.getElementById('apiRes');
            apiResDiv.children.textContext = '';
            // sendRequest 버튼이 클릭된 경우 처리
            handleSendRequest(event);
        }
    });
});

function handleSendRequest(event) {
    event.preventDefault();

    const sendRequestBtn = event.target;

    const apiResDiv = document.querySelector('.apiRes');

    // Response에 출력하기 전 비워주기
    apiResDiv.innerHTML = ``;
    const resContext = document.createElement('div');

    const params = document.getElementById('reqParams').value;
    const body = document.getElementById('reqBody').value;

    // 버튼 ID에 따라 API 요청을 구분
    switch (sendRequestBtn.id) {
        case 'getAccountsResSendBtn':
            getAccountAll().then(res => {
                for (let i in res.data) {
                    const userId = res.data[i].userId;
                    const createdAt = res.data[i].createdAt;

                    resContext.innerHTML += `
                    <p>userId: ${userId}, createdAt: ${createdAt}</p>
                    <br>
                    `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'updateAccountResSendBtn':
            updateAccount(JSON.parse(body)).then(res => {
                if (res) {
                    alert(`접속한 유저의 비밀번호가 수정되었습니다. 로그인 화면으로 이동합니다.`);
                    window.location.href = 'http://localhost:3333/api';
                    window.localStorage.clear();
                } else {
                    alert('500 SERVER ERROR');
                }
            });
            break;

        case 'getAccountResSendBtn':
            getAccountInfo().then(res => {
                for (const [key, value] of Object.entries(res.user)) {
                    resContext.innerHTML += `
                    <p class="users">${key}: ${value}</p>
                    <br>
                    `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

            sessionStorage.setItem('');
        case 'deleteAccountResSendBtn':
            deleteAccount().then(res => {
                const userId = res.data.userId;
                alert(`접속한 ${userId}가 정상적으로 삭제되었습니다. 로그인 화면으로 이동합니다.`);
                // 삭제가 되었으니 페이지를 기본 홈으로 이동
                window.location.href = 'http://localhost:3333/api';
            });
            break;

        case 'logoutAccountResSendBtn':
            logoutAccount().then(res => {
                if (res) {
                    alert('로그아웃 되었습니다. 로그인 화면으로 이동합니다.');
                    window.location.href = 'http://localhost:3333/api';
                }
            });
            break;

        // 내 팀 편성 조회
        case 'getTeamResSendBtn':
            getTeam().then(res => {
                const selectDiv = document.querySelector('.apiRes');

                let content = '';
                window.excludePlayer = async playerId => {
                    //확인창 출력
                    if (confirm('이 선수를 편성에서 제외 하시겠습니까? ')) {
                        excludeTeam(playerId);
                        alert('해당 선수가 편성에서 제외되었습니다. ');
                        getTeam();
                    }
                };

                for (let i in res) {
                    content += `<div class="myPlayer('${res[i].playerId}')">${res[i].playerName}     <button class="player" onclick="infoPlayer('${res[i].playerId}')" >상세 조회(미구현)</button>    <button class="player" onclick="excludePlayer('${res[i].playerId}')">편성 제외</button><br><br><br></div>`;
                }

                // // 상세보기 구현방법을 모르겠습니다
                // // querySelector 가 안되는 현상
                // window.infoPlayer = async playerId => {
                //     const div = document.querySelector(`.myPlayer${playerId}`);
                //     div.innerHTML = `${JSON.stringify(res)}`;
                // };

                selectDiv.innerHTML = content;
            });
            break;

        // 다른 유저의 편성 조회
        case 'getUserTeamResSendBtn':
            let content = '';
            const param = document.getElementById('reqParams').value;

            getUserTeam(param).then(res => {
                for (let i in res) {
                    content += `<div>${res[i].playerName}</div><br><br><br>`;
                }

                apiResDiv.innerHTML = content;
            });
            break;

        // 내 팀 편성 제외
        case 'excludeTeamResSendBtn':
            if (confirm(`playerId = ${body} 선수를 편성에서 제외 하시겠습니까? `)) {
                excludeTeam(body).then(res => {
                    apiResDiv.textContent = res.message;
                });
            }
            break;

        // 내 팀 편성 모두 제외
        case 'excludeTeamAllResSendBtn':
            if (confirm(`모든 선수를 편성에서 제외 하시겠습니까? `)) {
                excludeTeamAll().then(res => {
                    apiResDiv.textContent = res.message;
                });
            }
            break;

        // 내 팀 편성 추가
        case 'updateTeamResSendBtn':
            if (confirm(`playerId = ${body} 선수를 편성에 추가합니까? `)) {
                updateTeam(body).then(res => {
                    apiResDiv.textContent = res.message;
                });
            }
            break;

        case 'getPlayersResSendBtn':
            getPlayers().then(res => {
                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                for (let i in res.data) {
                    const playerName = res.data[i].playerName;
                    const position = res.data[i].positionId;

                    resContext.innerHTML += `
                <p class="users">선수명 : ${playerName}<br> 포지션 : ${position} </p>
                <br>
                `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'getPlayerDetailResSendBtn':
            getPlayerDetail(params).then(res => {
                const player = res.data;
                const playerName = res.data.playerName;
                const positionId = res.data.positionId;
                const playerStrength = res.data.playerStrength;
                const playerDefense = res.data.PlayerDefense;
                const playerStamina = res.data.playerStamina;
                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                resContext.innerHTML = `
                <p class="users">선수명 : ${playerName} <br> 포지션 아이디 : ${positionId} <br> 공격력 : ${playerStrength} <br> 수비력 : ${playerDefense} <br> 스테미나 : ${playerStamina}</p>
                `;
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'runCustomGameResSendBtn':
            // 매칭 성공 여부 확인하고... 성공했으면 게임에 필요한 데이터를 불러와야한다..
            const matchBody = { accountId: body };
            const runCustomBody = { targetAccountId: body };
            matchGame(matchBody)
                .then(res => {
                    if (res.errorMessage) {
                        resContext.innerHTML += `<p>${res.errorMessage}</p>`;
                        apiResDiv.appendChild(resContext);
                    } else {
                        runCustomGame(runCustomBody).then(async res => {
                            if (res) {
                                doDisplay(false);
                                const data = [res.myTeamInfo, res.targetInfo, res.enhanceInfo].map(info => {
                                    if (typeof info === 'object') {
                                        return JSON.stringify(info);
                                    }
                                    return info;
                                });

                                for (let i in data) {
                                    resContext.innerHTML += `<p>${data[i]}</p>`;
                                }
                                apiResDiv.appendChild(resContext);
                            } else if (!res) alert('매칭 데이터를 불러오는 중 실패하였습니다. 매칭을 취소합니다.');
                        });
                    }
                })
            break;

        default:
            console.log('이 버튼에 해당하는 API 기능이 없습니다');
    }
}
