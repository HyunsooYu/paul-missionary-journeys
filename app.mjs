import * as maplibregl from './maplibre-gl.mjs';
import { GOOGLE_MAPS_EMBED_API_KEY, GOOGLE_STREETVIEW_STATIC_API_KEY } from './site-config.mjs';
maplibregl.setWorkerUrl(new URL('./maplibre-gl-worker.mjs', import.meta.url).href);
const $=id=>document.getElementById(id);
let eventsVisible=true,drawerPane='event',googleView='map';
try{eventsVisible=localStorage.getItem('paul.events.visible')!=='0';}catch{}
function panelExtent(){const r=$('map-panels').getBoundingClientRect();return Number.isFinite(r.top)?Math.max(0,window.innerHeight-r.top):(eventsVisible?303:160);}
function syncPanelLayout(){document.documentElement.style.setProperty('--panel-extent',Math.ceil(panelExtent())+'px');}
function setEventsVisible(visible,persist=true){
 eventsVisible=visible;$('story-card').hidden=!visible;document.body.classList.toggle('events-hidden',!visible);
 $('toggle-events').textContent=visible?'사건 숨기기':'사건 표시';$('toggle-events').setAttribute('aria-expanded',String(visible));
 $('player-city').textContent=visible?stop().title:LOC[stop().key].name;
 if(persist){try{localStorage.setItem('paul.events.visible',visible?'1':'0');}catch{}}
 updateStreetviewPreview();syncPanelLayout();
}
function googleMapsUrl(mode,place=LOC[stop().key]){
 const coordinate=place.lat+','+place.lon;
 const url=new URL(mode==='map'?'https://www.google.com/maps/search/':'https://www.google.com/maps/@');
 url.searchParams.set('api','1');
 if(mode==='map'){url.searchParams.set('query',coordinate);}
 else if(mode==='streetview'){url.searchParams.set('map_action','pano');url.searchParams.set('viewpoint',coordinate);}
 else{url.searchParams.set('map_action','map');url.searchParams.set('center',coordinate);url.searchParams.set('zoom','15');url.searchParams.set('basemap','satellite');}
 return url.href;
}
function streetviewThumbnailUrl(place=LOC[stop().key]){
 if(!GOOGLE_STREETVIEW_STATIC_API_KEY)return null;
 const url=new URL('https://maps.googleapis.com/maps/api/streetview');
 url.searchParams.set('size','320x200');url.searchParams.set('location',place.lat+','+place.lon);
 url.searchParams.set('fov','90');url.searchParams.set('pitch','0');url.searchParams.set('radius','1000');
 url.searchParams.set('return_error_code','true');url.searchParams.set('key',GOOGLE_STREETVIEW_STATIC_API_KEY);
 return url.href;
}
function updateStreetviewPreview(){
 const l=LOC[stop().key],link=$('streetview-preview'),image=$('streetview-image');
 link.href=googleMapsUrl('streetview',l);link.setAttribute('aria-label',l.name+' · '+l.modern+' Google 거리뷰 새 창에서 열기');
 image.alt=l.modern+' 인근 Google 거리뷰 사진';
 const src=eventsVisible?streetviewThumbnailUrl(l):null;
 if(!src){image.removeAttribute('src');image.hidden=true;$('streetview-empty').hidden=false;link.dataset.state='unavailable';$('streetview-state').textContent='사진 미리보기 없음';return;}
 if(image.getAttribute('src')===src)return;
 image.hidden=true;$('streetview-empty').hidden=false;link.dataset.state='loading';$('streetview-state').textContent='사진 불러오는 중';image.setAttribute('src',src);
}
function googleEmbedUrl(mode,place=LOC[stop().key]){
 if(!GOOGLE_MAPS_EMBED_API_KEY)return null;
 const coordinate=place.lat+','+place.lon,url=new URL('https://www.google.com/maps/embed/v1/'+(mode==='streetview'?'streetview':'view'));
 url.searchParams.set('key',GOOGLE_MAPS_EMBED_API_KEY);url.searchParams.set('language','ko');
 if(mode==='streetview'){url.searchParams.set('location',coordinate);}
 else{url.searchParams.set('center',coordinate);url.searchParams.set('zoom','15');url.searchParams.set('maptype',mode==='satellite'?'satellite':'roadmap');}
 return url.href;
}
function updatePresentPlace(){
 const l=LOC[stop().key];updateStreetviewPreview();
 for(const mode of ['map','satellite','streetview']){$('google-'+mode).href=googleMapsUrl(mode,l);$('google-'+mode).setAttribute('aria-label',l.name+' '+(mode==='map'?'Google 지도':mode==='satellite'?'위성사진':'거리뷰')+' 새 창에서 열기');}
 $('present-coordinates').textContent=l.lat.toFixed(4)+'° N · '+l.lon.toFixed(4)+'° E';
 const enabled=!!GOOGLE_MAPS_EMBED_API_KEY;$('google-embed').hidden=!enabled;
 if(enabled&&drawerPane==='present'&&$('drawer').classList.contains('open')){
  const src=googleEmbedUrl(googleView,l);if($('google-frame').getAttribute('src')!==src)$('google-frame').setAttribute('src',src);
  $('google-frame').title=l.modern+' Google 지도';
 }
}
function setDrawerPane(pane){
 drawerPane=pane;
 for(const id of ['event','present']){const active=id===pane;$('drawer-'+id).hidden=!active;$('tab-'+id).setAttribute('aria-selected',String(active));$('tab-'+id).setAttribute('tabindex',active?'0':'-1');}
 updatePresentPlace();
}

const LOC={
 antioch:{name:'수리아 안디옥',modern:'튀르키예 안타키아 일대',lat:36.20,lon:36.16,tags:['파송 교회','수리아']},
 seleucia:{name:'실루기아',modern:'튀르키예 사만다으 인근 옛 항구',lat:36.10,lon:35.96,tags:['항구']},
 salamis:{name:'살라미',modern:'키프로스 동부 유적지',lat:35.18,lon:33.91,tags:['키프로스','회당']},
 paphos:{name:'바보',modern:'키프로스 파포스',lat:34.76,lon:32.41,tags:['키프로스','로마 총독']},
 perga:{name:'버가',modern:'튀르키예 안탈리아 인근',lat:36.96,lon:30.85,tags:['밤빌리아']},
 pisidian:{name:'비시디아 안디옥',modern:'튀르키예 얄바츠 인근',lat:38.31,lon:31.19,tags:['회당','소아시아']},
 iconium:{name:'이고니온',modern:'튀르키예 코니아',lat:37.87,lon:32.49,tags:['소아시아']},
 lystra:{name:'루스드라',modern:'튀르키예 하툰사라이 인근(위치 근사)',lat:37.59,lon:32.34,tags:['디모데의 고향 부근','위치 근사']},
 derbe:{name:'더베',modern:'튀르키예 카라만 북동부 추정 유적지',lat:37.35,lon:33.36,tags:['유적지 논쟁','위치 추정']},
 attalia:{name:'앗달리아',modern:'튀르키예 안탈리아',lat:36.88,lon:30.70,tags:['항구']},
 troas:{name:'드로아',modern:'튀르키예 알렉산드리아 트로아 유적',lat:39.75,lon:26.16,tags:['마게도냐 환상','항구']},
 samothrace:{name:'사모드라게',modern:'그리스 사모트라키섬',lat:40.47,lon:25.53,tags:['에게해 항해']},
 neapolis:{name:'네압볼리',modern:'그리스 카발라',lat:40.94,lon:24.41,tags:['마게도냐 항구']},
 philippi:{name:'빌립보',modern:'그리스 크리니데스 인근 유적',lat:41.01,lon:24.29,tags:['로마 식민시','루디아']},
 amphipolis:{name:'암비볼리',modern:'그리스 암피폴리',lat:40.82,lon:23.85,tags:['경유 도시','행 17장']},
 apollonia:{name:'아볼로니아',modern:'그리스 볼비호 서쪽 인근(위치 근사)',lat:40.65,lon:23.45,tags:['경유 도시','행 17장']},
 thessalonica:{name:'데살로니가',modern:'오늘날 그리스 테살로니키',lat:40.64,lon:22.94,tags:['행 17장','항구 도시','회당']},
 berea:{name:'베레아',modern:'오늘날 그리스 베리아',lat:40.52,lon:22.20,tags:['행 17장','말씀 상고']},
 athens:{name:'아덴',modern:'오늘날 그리스 아테네',lat:37.975,lon:23.726,tags:['행 17장','아레오바고','그리스 철학']},
 corinth:{name:'고린도',modern:'그리스 고대 코린토스',lat:37.91,lon:22.88,tags:['아가야','장기 체류']},
 cenchrea:{name:'겐그레아',modern:'그리스 케흐리에스',lat:37.88,lon:22.99,tags:['동쪽 항구']},
 ephesus:{name:'에베소',modern:'튀르키예 셀축 인근 유적',lat:37.94,lon:27.34,tags:['소아시아','아데미 신전']},
 caesarea:{name:'가이사랴',modern:'이스라엘 카이사레아 마리티마',lat:32.50,lon:34.89,tags:['로마 시대 항구']},
 jerusalem:{name:'예루살렘',modern:'오늘날 예루살렘',lat:31.78,lon:35.23,tags:['유대']},
 assos:{name:'앗소',modern:'튀르키예 베흐람칼레',lat:39.49,lon:26.34,tags:['육로·항해']},
 mytilene:{name:'미둘레네',modern:'그리스 레스보스섬 미틸리니',lat:39.11,lon:26.56,tags:['섬 항구']},
 chios:{name:'기오',modern:'그리스 히오스섬',lat:38.37,lon:26.14,tags:['항해']},
 samos:{name:'사모',modern:'그리스 사모스섬',lat:37.76,lon:26.97,tags:['항해']},
 trogyllium:{name:'드로길리움',modern:'튀르키예 미칼레 곶 일대(위치 추정)',lat:37.69,lon:27.08,tags:['위치 근사','항해']},
 miletus:{name:'밀레도',modern:'튀르키예 발라트 인근 유적',lat:37.53,lon:27.28,tags:['작별 설교','장로들']},
 cos:{name:'고스',modern:'그리스 코스섬',lat:36.89,lon:27.29,tags:['항해']},
 rhodes:{name:'로도',modern:'그리스 로도스섬',lat:36.44,lon:28.22,tags:['항해']},
 patara:{name:'바다라',modern:'튀르키예 파타라 유적',lat:36.26,lon:29.32,tags:['항구']},
 tyre:{name:'두로',modern:'레바논 수르',lat:33.27,lon:35.20,tags:['항구']},
 ptolemais:{name:'돌레마이',modern:'이스라엘 아코',lat:32.93,lon:35.08,tags:['항구']}
};
const S=(key,ref,title,summary,opts={})=>({key,ref,title,summary,mode:'land',...opts});
const TRIPS={
 1:{name:'1차 전도여행',verse:'사도행전 13–14장',period:'약 AD 46–48',color:'#c16f4b',summary:'바나바와 함께 구브로와 소아시아의 여러 도시에서 복음을 전하고 돌아온 여정.',stops:[
 S('antioch','행 13:1–3','선교사 파송','안디옥 교회가 금식하고 기도하는 가운데 성령의 인도하심으로 바나바와 바울을 파송합니다.'),
 S('seleucia','행 13:4','항구에서 출발','실루기아에서 배를 타고 구브로섬으로 출발합니다.'),
 S('salamis','행 13:5','회당에서 복음 전파','구브로 동쪽 살라미의 여러 유대인 회당에서 말씀을 선포합니다.',{mode:'sea'}),
 S('paphos','행 13:6–12','총독의 믿음','바보에서 바예수(엘루마)와 마주하고 총독 서기오 바울이 믿게 됩니다.'),
 S('perga','행 13:13','마가 요한의 귀환','버가에 이르러 마가 요한이 일행을 떠나 예루살렘으로 돌아갑니다.',{mode:'sea'}),
 S('pisidian','행 13:14–52','비시디아 회당 설교','안식일 회당에서 예수 그리스도의 구원을 선포하고 이방인에게도 복음이 전파됩니다.'),
 S('iconium','행 14:1–7','믿음과 반대','이고니온 회당에서 말씀을 전하고 많은 이들이 믿지만 반대도 심해집니다.'),
 S('lystra','행 14:8–20','치유와 박해','걷지 못하던 사람이 낫자 군중은 바울 일행을 신으로 오해하고, 이후 바울이 돌에 맞습니다.'),
 S('derbe','행 14:20–21','많은 제자를 얻음','더베에서 복음을 전하고 많은 사람을 제자로 삼습니다.'),
 S('lystra','행 14:21–23','교회들을 격려','돌아오는 길에 제자들의 마음을 굳게 하고 장로들을 세웁니다.'),
 S('iconium','행 14:21–23','교회들을 격려','앞서 방문한 공동체를 다시 찾아 믿음을 격려합니다.'),
 S('pisidian','행 14:21–23','교회들을 격려','고난 가운데도 하나님 나라에 들어가는 믿음의 길을 격려합니다.'),
 S('perga','행 14:24–25','다시 말씀 전파','밤빌리아로 돌아와 버가에서 말씀을 전합니다.'),
 S('attalia','행 14:25','귀환 항구','앗달리아에서 배를 타고 안디옥으로 돌아갈 준비를 합니다.'),
 S('antioch','행 14:26–28','선교 보고','안디옥 교회로 돌아와 하나님이 이방인들에게 믿음의 문을 여신 일을 보고합니다.',{mode:'sea'})
 ]},
 2:{name:'2차 전도여행',verse:'사도행전 15:36–18:22',period:'약 AD 49–52',color:'#287e9d',summary:'실라와 함께 소아시아를 지나 마게도냐와 그리스로 복음의 길이 넓어진 여정.',stops:[
 S('antioch','행 15:36–41','실라와 함께 출발','바나바와 헤어진 후 실라와 함께 교회들을 돌아보기 위해 길을 떠납니다.'),
 S('derbe','행 16:1','교회들을 방문','더베와 루스드라에 이르러 믿음의 공동체를 찾아갑니다.',{mode:'uncertain'}),
 S('lystra','행 16:1–5','디모데와 동역','루스드라에서 제자 디모데를 만나 선교 동역자로 동행합니다.'),
 S('troas','행 16:6–10','마게도냐 사람의 환상','성령의 인도 가운데 여러 지역을 거쳐 드로아에 도착하고 마게도냐로 건너오라는 환상을 봅니다.',{mode:'uncertain'}),
 S('samothrace','행 16:11','에게해를 건너다','드로아를 떠나 배를 타고 사모드라게로 항해합니다.',{mode:'sea'}),
 S('neapolis','행 16:11','유럽 대륙에 도착','다음 날 네압볼리 항구에 이릅니다.',{mode:'sea'}),
 S('philippi','행 16:12–40','루디아와 간수의 믿음','빌립보에서 루디아와 간수의 믿음 이야기가 펼쳐지고 바울과 실라가 투옥됩니다.'),
 S('amphipolis','행 17:1','마게도냐의 도로를 따라','빌립보를 떠난 일행이 암비볼리를 지나 서쪽으로 이동합니다.',{focus:true,mode:'land',background:['암비볼리는 스트리몬강 부근의 중요한 교통 요충지였습니다.','사도행전 17:1은 통과 사실만 기록하며 이 도시의 구체적인 전도 사건은 서술하지 않습니다.']}),
 S('apollonia','행 17:1','아볼로니아를 통과','암비볼리에서 데살로니가로 이어지는 여정 중 아볼로니아를 통과합니다.',{focus:true,background:['아볼로니아는 마게도냐 내륙을 연결하는 길목에 자리했습니다.','정확한 고대 도시의 위치는 교육용 지도의 근사 좌표로 표시했습니다.']}),
 S('thessalonica','행 17:1–9','회당에서 그리스도를 전하다','바울은 세 안식일에 걸쳐 성경을 강론하고 그리스도의 고난과 부활을 설명합니다. 일부 사람들은 믿지만 반대자들이 소동을 일으키며 야손을 문제 삼습니다.',{focus:true,background:['마게도냐의 중요한 항구 도시이자 로마의 도로망과 연결된 교역 중심지였습니다.','바울은 유대인 회당에서 먼저 성경을 가지고 토론했습니다.','예수를 왕으로 전한다는 비난은 당시 로마 황제권과 충돌하는 정치적 혐의로 제기되었습니다.'],verseSummary:'바울은 성경을 풀어 예수께서 그리스도이심을 증언했고, 일부는 믿었으나 시기와 소동으로 이어졌습니다.',question:'바울이 데살로니가에서 가장 먼저 회당을 찾은 이유는 무엇일까요?',answer:'회당에는 구약성경을 알고 있는 유대인과 하나님을 경외하는 사람들이 모였습니다. 바울은 그들이 알고 있던 성경을 근거로 예수님이 그리스도이심을 설명했습니다. 다만 회당 방문을 로마 법의 확실한 보호 장치로 일반화하기는 어렵습니다.'}),
 S('berea','행 17:10–15','말씀을 날마다 상고하다','밤중에 베레아로 이동한 바울과 실라는 회당에서 복음을 전합니다. 베레아 사람들은 말씀을 기꺼이 받고 날마다 성경을 상고합니다. 뒤이어 데살로니가의 반대자들이 와서 소동을 일으킵니다.',{focus:true,background:['베레아는 오늘날 그리스 베리아에 해당하는 내륙 도시입니다.','성경 본문은 베레아 사람들이 바울의 말을 성경과 대조해 확인했다고 강조합니다.','데살로니가에서 온 반대가 이곳까지 이어지자 바울은 떠나고 실라와 디모데는 남습니다.'],verseSummary:'베레아 사람들은 간절한 마음으로 말씀을 받고 이것이 그러한가 하여 날마다 성경을 상고했습니다.',question:'베레아 사람들의 태도에서 오늘날 성경 공부에 적용할 점은 무엇일까요?',answer:'가르침을 열린 마음으로 받아들이되 성경을 직접 살펴보고 검증하는 태도입니다. 설교자의 설명과 성경 본문을 구별해 읽는 학습 방법으로도 연결됩니다.'}),
 S('athens','행 17:16–34','아레오바고의 복음 변증','우상이 가득한 도시를 보고 마음에 격분한 바울은 회당과 시장에서 변론하고 아레오바고에서 창조주 하나님, 회개, 심판과 부활을 선포합니다.',{focus:true,mode:'uncertain',background:['아덴(아테네)은 그리스 철학·교육·종교 활동의 중심지였습니다.','사도행전은 에피쿠로스학파와 스토아학파 철학자들이 바울과 논쟁했다고 기록합니다.','“알지 못하는 신에게”라는 제단을 출발점으로 창조주와 부활의 복음을 설명합니다.'],verseSummary:'바울은 “알지 못하는 신”의 제단을 언급하며 천지를 지으신 하나님과 죽은 자 가운데서 부활하신 예수 그리스도를 선포했습니다.',question:'바울은 아덴에서 왜 데살로니가와 다른 방식으로 말씀을 전했을까요?',answer:'데살로니가의 회당에서는 이미 아는 성경을 근거로 설명했지만, 아덴에서는 다신교와 철학을 아는 청중에게 창조주 하나님을 먼저 소개했습니다. 복음의 핵심을 유지하며 출발점을 달리한 것입니다.'}),
 S('corinth','행 18:1–17','고린도에서 오래 머물다','아덴을 떠나 고린도에 가서 브리스길라와 아굴라를 만나고 오랫동안 사역합니다.'),
 S('cenchrea','행 18:18','겐그레아 항구','고린도의 동쪽 항구 겐그레아를 통해 배로 이동할 준비를 합니다.'),
 S('ephesus','행 18:19–21','에베소 회당에서 변론','에베소에 들러 회당에서 변론하지만 오래 머물지는 않습니다.',{mode:'sea'}),
 S('caesarea','행 18:22','가이사랴 상륙','가이사랴에 도착해 육지로 올라간 뒤 교회에 문안하고 안디옥으로 향합니다.',{mode:'sea'}),
 S('antioch','행 18:22','안디옥 귀환','안디옥으로 돌아오며 2차 전도여행을 마칩니다.',{mode:'uncertain'})
 ]},
 3:{name:'3차 전도여행',verse:'사도행전 18:23–21:17',period:'약 AD 53–57',color:'#647b61',summary:'에베소에서 오랜 기간 사역한 후 마게도냐·헬라를 거쳐 예루살렘으로 돌아온 여정.',stops:[
 S('antioch','행 18:23','다시 길을 떠나다','안디옥을 떠나 갈라디아와 브루기아 지방의 제자들을 굳게 합니다.'),
 S('ephesus','행 19:1–41','에베소의 오랜 사역','에베소에서 복음을 전하고 가르치며 아데미 숭배와 관련된 소동도 겪습니다.',{mode:'uncertain'}),
 S('philippi','행 20:1–6','마게도냐·헬라 방문 뒤','에베소를 떠나 마게도냐와 헬라 지역을 방문하고, 빌립보에서 배를 타고 다시 드로아로 향합니다.',{mode:'uncertain'}),
 S('troas','행 20:6–12','드로아에서의 밤','드로아에서 말씀을 전하던 중 유두고가 창문에서 떨어지는 사건이 기록됩니다.',{mode:'sea'}),
 S('assos','행 20:13–14','앗소에서 만남','바울은 육로로 앗소에 도착하고 다른 동역자들은 배로 이동해 합류합니다.',{mode:'land'}),
 S('mytilene','행 20:14','미둘레네 도착','일행이 배를 타고 미둘레네에 도착합니다.',{mode:'sea'}),
 S('chios','행 20:15','기오 맞은편을 지나다','배를 타고 기오 맞은편으로 지나갑니다.',{mode:'sea'}),
 S('samos','행 20:15','사모를 지나다','그다음 날 사모 쪽으로 항해합니다.',{mode:'sea'}),
 S('trogyllium','행 20:15','드로길리움 부근','드로길리움에 머문 것으로 전하는 본문 전통이 있습니다. 위치는 근사치입니다.',{mode:'sea'}),
 S('miletus','행 20:15–38','밀레도 작별 설교','바울이 에베소 장로들을 불러 마지막으로 격려하고 작별의 기도를 드립니다.',{mode:'sea'}),
 S('cos','행 21:1','고스섬','밀레도를 떠나 고스로 항해합니다.',{mode:'sea'}),
 S('rhodes','행 21:1','로도섬','로도를 거쳐 계속 항해합니다.',{mode:'sea'}),
 S('patara','행 21:1–2','바다라에서 배를 갈아타다','바다라에서 베니게로 건너가는 배를 만나 타고 이동합니다.',{mode:'sea'}),
 S('tyre','행 21:3–6','두로에서 제자들과 만남','두로에 상륙해 제자들과 머물며 기도합니다.',{mode:'sea'}),
 S('ptolemais','행 21:7','돌레마이에서 문안','돌레마이에 도착해 형제들에게 문안하고 하루를 지냅니다.',{mode:'sea'}),
 S('caesarea','행 21:8–14','가이사랴와 아가보','전도자 빌립의 집에 머물며 아가보의 예언을 듣습니다.',{mode:'land'}),
 S('jerusalem','행 21:15–17','예루살렘 도착','예루살렘에 도착하고 형제들의 영접을 받습니다.',{mode:'land'})
 ]}
};

const STYLES={night:'https://tiles.openfreemap.org/styles/fiord',bright:'https://tiles.openfreemap.org/styles/bright'};
// A second provider keeps the route usable when the primary tile service is slow.
function fallbackStyle(){return {version:8,sources:{'osm-fallback':{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}},layers:[{id:'osm-basemap',type:'raster',source:'osm-fallback',paint:currentStyle==='night'?{'raster-saturation':-.75,'raster-brightness-max':.55,'raster-contrast':.1}:{}}]};}
let fallbackActive=false, baseTileReady=false, styleGeneration=0, mapWatchdog;
function connection(state){$('map-status').dataset.state=state;$('map-status').textContent=state==='ready'?'지도 연결됨':state==='error'?'연결 확인 필요':'지도 연결 중';}
function watchMap(){
 clearTimeout(mapWatchdog);baseTileReady=false;connection('pending');
 mapWatchdog=setTimeout(()=>{if(baseTileReady)return;if(!fallbackActive){loadBasemap(true)}else{connection('error');$('error').classList.add('show');}},12000);
}
function loadBasemap(useFallback=fallbackActive){
 pause();fallbackActive=useFallback;mapReady=false;styleGeneration++;$('error').classList.remove('show');watchMap();
 map.setStyle(fallbackActive?fallbackStyle():STYLES[currentStyle]);
}

const ICON={1:'#ee9473',2:'#edc278',3:'#91d9c1'};
let trip=2, focus=true, selected=9, currentStyle='night', pitched=true, playing=false, playbackToken=0, mapReady=false, markers=[], traveler=null, progressRoute=null, routeEnds=[], animFrame=0;
// 17장 집중 보기: 빌립보에서 시작해 암비볼리·아볼로니아·데살로니가·베레아·아덴까지.
function seq(){return trip===2&&focus?[6,7,8,9,10,11]:TRIPS[trip].stops.map((_,i)=>i)}
function stop(){return TRIPS[trip].stops[selected]}
function ll(key){const x=LOC[key];return [x.lon,x.lat]}
const map=new maplibregl.Map({container:'map',style:STYLES.night,center:[26.2,39.5],zoom:5.2,minZoom:3.3,maxZoom:14,bearing:-9,pitch:35,attributionControl:false,renderWorldCopies:false,antialias:true});
map.addControl(new maplibregl.AttributionControl({compact:false}),'bottom-right');
map.dragRotate.enable();map.touchZoomRotate.enableRotation();
map.on('error',e=>{if(e?.error?.message) console.warn('Map:',e.error.message)});
map.on('style.load',()=>{mapReady=true;installLayers();render(true);if(styleGeneration===0)fit();});
map.on('sourcedata',e=>{
 if(e.sourceId!==(fallbackActive?'osm-fallback':'openmaptiles')||e.sourceDataType!=='content'||!['vector','raster'].includes(e.source?.type))return;
 baseTileReady=true;clearTimeout(mapWatchdog);connection('ready');$('error').classList.remove('show');
});
watchMap();
render(true);
function createGeo(coords){return {type:'Feature',geometry:{type:'LineString',coordinates:coords.length>=2?coords:[[0,0],[0,0]]},properties:{}}}
function segGeo(coords,type){return {type:'FeatureCollection',features:coords.map(c=>({type:'Feature',properties:{mode:c.mode},geometry:{type:'LineString',coordinates:c.points}}))}}
function routeSegments(){const ss=seq(),all=TRIPS[trip].stops;return ss.slice(1).map((i,n)=>({points:[ll(all[ss[n]].key),ll(all[i].key)],mode:all[i].mode}));}
function routeCoords(){const all=TRIPS[trip].stops;return seq().map(i=>ll(all[i].key))}
function installLayers(){
 const segments=routeSegments(),colors=ICON[trip];
 if(map.getSource('route-all')){['progress-line','progress-halo','route-unknown','route-base','route-halo'].forEach(id=>{if(map.getLayer(id))map.removeLayer(id)});['route-all','route-progress','route-uncertain'].forEach(id=>{if(map.getSource(id))map.removeSource(id)})}
 const known=segments.filter(s=>s.mode!=='uncertain'),unknown=segments.filter(s=>s.mode==='uncertain');
 map.addSource('route-all',{type:'geojson',data:segGeo(known)});
 map.addSource('route-uncertain',{type:'geojson',data:segGeo(unknown)});
 map.addSource('route-progress',{type:'geojson',data:createGeo(routeCoords().slice(0,2))});
 const common={ 'line-join':'round','line-cap':'round' };
 map.addLayer({id:'route-halo',type:'line',source:'route-all',layout:common,paint:{'line-color':colors,'line-width':12,'line-blur':11,'line-opacity':.46}});
 map.addLayer({id:'route-base',type:'line',source:'route-all',layout:common,paint:{'line-color':colors,'line-width':2.8,'line-opacity':.56}});
 map.addLayer({id:'route-unknown',type:'line',source:'route-uncertain',layout:common,paint:{'line-color':colors,'line-width':2.6,'line-dasharray':[2.4,2.4],'line-opacity':.85}});
 map.addLayer({id:'progress-halo',type:'line',source:'route-progress',layout:common,paint:{'line-color':'#fff3c9','line-width':17,'line-blur':12,'line-opacity':.59}});
 map.addLayer({id:'progress-line',type:'line',source:'route-progress',layout:common,paint:{'line-color':colors,'line-width':5,'line-opacity':1}});
 markerBuild();
}
function markerBuild(){markers.forEach(o=>o.marker.remove());markers=[];if(traveler){traveler.remove();traveler=null}
 let all=TRIPS[trip].stops,done=new Set(),ss=seq(),featured=new Set(['antioch','philippi','troas','thessalonica','berea','athens','ephesus','corinth','jerusalem','lystra','paphos','pisidian','miletus']);
 ss.forEach(i=>{let key=all[i].key;if(done.has(key))return;done.add(key);let el=document.createElement('div');el.className='map-pin';el.style.setProperty('--pin-color',ICON[trip]);el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',LOC[key].name+' 선택');el.innerHTML='<div class="pin-core"></div><span class="pin-label"></span>';el.querySelector('.pin-label').textContent=LOC[key].name;
 if(featured.has(key)||focus)el.classList.add('featured');else el.classList.add('dim');
 el.addEventListener('click',()=>{pause();select(i,true)});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pause();select(i,true)}});
 let marker=new maplibregl.Marker({element:el,anchor:'center'}).setLngLat(ll(key)).addTo(map);markers.push({marker,el,i,key});});
 const travelEl=document.createElement('div');travelEl.className='traveler';traveler=new maplibregl.Marker({element:travelEl,anchor:'center'}).setLngLat(ll(all[selected].key)).addTo(map);travelEl.style.opacity='0';
}
function updateProgress(fraction=null){if(!mapReady)return;let ss=seq(),idx=Math.max(0,ss.indexOf(selected)),route=routeCoords();let pts=route.slice(0,idx+1);if(fraction!=null&&idx<route.length-1){const [a,b]=[route[idx],route[idx+1]];pts.push([a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction])}else if(pts.length===1){pts.push(pts[0]);}
 map.getSource('route-progress')?.setData(createGeo(pts));let pos=pts[pts.length-1];if(traveler){traveler.setLngLat(pos);traveler.getElement().style.opacity='1';}
 markers.forEach(({el,i,key})=>{el.classList.toggle('selected',key===stop().key);el.style.opacity=(ss.indexOf(i)<=idx||key===stop().key)?'1':'.82'});
 let pct=ss.length===1?100:((idx+(fraction||0))/(ss.length-1))*100;$('track-fill').style.width=pct+'%';$('track-head').style.left=pct+'%';$('track').setAttribute('aria-valuenow',String(idx));$('track').setAttribute('aria-valuemax',String(ss.length-1));}
function fit(){if(!mapReady)return;let coords=routeCoords(),minLon=Math.min(...coords.map(p=>p[0])),minLat=Math.min(...coords.map(p=>p[1])),maxLon=Math.max(...coords.map(p=>p[0])),maxLat=Math.max(...coords.map(p=>p[1]));let narrow=window.innerWidth<700;
 // On mobile panels overlap the bottom section: favor map top area.
 let h=window.innerHeight,w=window.innerWidth;let padding=narrow?{top:Math.min(175,h*.28),bottom:Math.min(panelExtent()+16,h*.44),left:30,right:30}:{top:Math.min(160,h*.24),bottom:Math.min(panelExtent()+16,h*.38),left:Math.min(100,w*.12),right:Math.min(100,w*.12)};
 map.fitBounds([[minLon,minLat],[maxLon,maxLat]],{padding,bearing:narrow?0:-8,pitch:pitched?28:0,maxZoom:focus?8:6.3,duration:1150});}
function camera(i){if(!mapReady)return;const a=seq(),first=stop(),coord=ll(first.key);let narrow=window.innerWidth<700;
 map.flyTo({center:coord,zoom:focus?7.65:7.2,bearing:pitched?-10:0,pitch:pitched?48:0,speed:1.1,curve:1.45,essential:true,offset:[0,narrow?-65:50],duration:1350});}
function select(i,fly){if(!seq().includes(i))return;selected=i;const s=stop(),l=LOC[s.key],ss=seq(),pos=ss.indexOf(selected);
 $('city').textContent=l.name;$('modern').textContent=l.modern;$('event').textContent=s.summary;$('verse').textContent=s.ref.replace('행 ','사도행전 ');$('counter').textContent=String(pos+1).padStart(2,'0')+' / '+String(ss.length).padStart(2,'0');$('player-frame').textContent=$('counter').textContent;$('player-city').textContent=eventsVisible?s.title:l.name;
 $('card-kicker').textContent=focus?'ACTS 17 · DESTINATION':`JOURNEY ${String(trip).padStart(2,'0')} · DESTINATION`;
 $('drawer-city').textContent=l.name;$('drawer-modern').textContent=l.modern;$('drawer-title').textContent=s.title;$('drawer-desc').textContent=s.summary;$('drawer-ref').textContent=s.ref.replace('행 ','사도행전 ');
 document.querySelectorAll('.scene-chip').forEach(b=>b.classList.toggle('active',b.dataset.city===s.key));updatePresentPlace();updateProgress();if(fly)camera(i);}
function render(first=false){document.querySelectorAll('[data-trip]').forEach(b=>b.classList.toggle('selected',+b.dataset.trip===trip));$('focus').classList.toggle('on',focus&&trip===2);$('focus').textContent=(focus&&trip===2?'✦ 17장 집중':'✧ 17장 집중');$('chapters').hidden=!(trip===2&&focus);$('hero-kicker').textContent=focus&&trip===2?'ACTS · CHAPTER 17':`THE ${trip===1?'FIRST':trip===2?'SECOND':'THIRD'} MISSIONARY JOURNEY`;$('hero-title').textContent=focus&&trip===2?'세 도시, 하나의 복음':TRIPS[trip].name;$('hero-desc').textContent=focus&&trip===2?'데살로니가 → 베레아 → 아덴':TRIPS[trip].verse+' · '+TRIPS[trip].period;
 $('player-caption').textContent=focus?'ACTS 17 / THE ROUTE':`0${trip} / PAUL'S JOURNEY`;
 const ss=seq();if(!ss.includes(selected))selected=ss[0];if(mapReady&&!first)installLayers();select(selected,false);
 const pills=$('pills');pills.replaceChildren();if(focus&&trip===2){[9,10,11].forEach(i=>{let b=document.createElement('button');b.className='city-pill';b.textContent=LOC[TRIPS[trip].stops[i].key].name;b.addEventListener('click',()=>{pause();select(i,true)});pills.appendChild(b)})}
 $('track').setAttribute('aria-valuemax',String(ss.length-1));}
function switchTrip(n){pause();trip=n;focus=false;selected=0;render();fit();}
function focusTrip(){pause();if(trip!==2){trip=2;focus=true;selected=9}else{focus=!focus;selected=focus?9:0}render();fit();}
function move(d){pause();let ss=seq(),i=Math.max(0,Math.min(ss.length-1,ss.indexOf(selected)+d));select(ss[i],true)}
const wait=t=>new Promise(resolve=>setTimeout(resolve,t));
function pause(){playing=false;playbackToken++;cancelAnimationFrame(animFrame);$('play').textContent='▶';$('play').setAttribute('aria-label','재생');updateProgress();}
async function play(){if(!mapReady)return;if(playing){pause();return}let ss=seq();if(ss.indexOf(selected)===ss.length-1)select(ss[0],true);playing=true;let token=++playbackToken;$('play').textContent='Ⅱ';$('play').setAttribute('aria-label','일시정지');
 while(playing&&token===playbackToken){let idx=ss.indexOf(selected);if(idx>=ss.length-1){pause();break}let start=performance.now(),duration=1500;let from=ll(TRIPS[trip].stops[ss[idx]].key),to=ll(TRIPS[trip].stops[ss[idx+1]].key);
 await new Promise(resolve=>{function frame(now){if(!playing||token!==playbackToken){resolve();return}let t=Math.min(1,(now-start)/duration);updateProgress(t);if(traveler)traveler.setLngLat([from[0]+(to[0]-from[0])*t,from[1]+(to[1]-from[1])*t]);if(t>=1){resolve();return}animFrame=requestAnimationFrame(frame)}animFrame=requestAnimationFrame(frame)});
 if(!playing||token!==playbackToken)break;select(ss[idx+1],true);await wait(450);
 }
}
function changeStyle(){currentStyle=currentStyle==='night'?'bright':'night';$('style').classList.toggle('active',currentStyle==='bright');loadBasemap();}
function showDrawer(open,pane='event'){$('drawer').classList.toggle('open',open);$('shade').classList.toggle('open',open);if(open)setDrawerPane(pane);}
for(const b of document.querySelectorAll('[data-trip]'))b.addEventListener('click',()=>switchTrip(+b.dataset.trip));
$('streetview-image').addEventListener('load',()=>{
 $('streetview-image').hidden=false;$('streetview-empty').hidden=true;$('streetview-preview').dataset.state='ready';
});
$('streetview-image').addEventListener('error',()=>{
 $('streetview-image').hidden=true;$('streetview-empty').hidden=false;$('streetview-preview').dataset.state='unavailable';$('streetview-state').textContent='사진 미리보기 없음';
});
$('toggle-events').addEventListener('click',()=>setEventsVisible(!eventsVisible));
$('modern-open').addEventListener('click',()=>showDrawer(true,'present'));
for(const pane of ['event','present']){
 $('tab-'+pane).addEventListener('click',()=>setDrawerPane(pane));
 $('tab-'+pane).addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=pane==='event'?'present':'event';setDrawerPane(next);$('tab-'+next).focus();}});
}
for(const b of document.querySelectorAll('[data-google-view]'))b.addEventListener('click',()=>{googleView=b.dataset.googleView;document.querySelectorAll('[data-google-view]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));updatePresentPlace();});
setEventsVisible(eventsVisible,false);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(syncPanelLayout).observe($('map-panels'));
$('focus').addEventListener('click',focusTrip);$('zoom-in').addEventListener('click',()=>map.zoomIn());$('zoom-out').addEventListener('click',()=>map.zoomOut());$('fit').addEventListener('click',fit);$('tilt').addEventListener('click',()=>{pitched=!pitched;map.easeTo({pitch:pitched?48:0,bearing:pitched?-10:0,duration:900});$('tilt').classList.toggle('active',pitched)});$('style').addEventListener('click',changeStyle);
$('prev').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));$('play').addEventListener('click',play);$('more').addEventListener('click',()=>showDrawer(true));$('drawer-close').addEventListener('click',()=>showDrawer(false));$('shade').addEventListener('click',()=>showDrawer(false));
document.querySelectorAll('[data-city]').forEach(b=>b.addEventListener('click',()=>{pause();const i=seq().find(i=>TRIPS[trip].stops[i].key===b.dataset.city);if(i!=null)select(i,true)}));
const track=$('track');function scrub(clientX){let p=Math.max(0,Math.min(1,(clientX-track.getBoundingClientRect().left)/track.clientWidth)),a=seq(),i=Math.round(p*(a.length-1));pause();select(a[i],true)}track.addEventListener('pointerdown',e=>{track.setPointerCapture(e.pointerId);scrub(e.clientX)});track.addEventListener('pointermove',e=>{if(e.buttons===1)scrub(e.clientX)});track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){move(1);e.preventDefault()}if(e.key==='ArrowLeft'){move(-1);e.preventDefault()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')showDrawer(false);if(e.key===' '&&document.activeElement===document.body){e.preventDefault();play()}if(document.activeElement===document.body&&e.key==='ArrowRight')move(1);if(document.activeElement===document.body&&e.key==='ArrowLeft')move(-1)});
map.on('click',()=>{});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{map.resize();syncPanelLayout()},90)});
window.addEventListener('online',()=>{if(!baseTileReady)loadBasemap(false)});
