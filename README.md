# 바울의 전도여행 지도 · GitHub Pages

사건 박스 숨기기, 현대 지명 확인, Google 지도·위성사진·거리뷰 연결이 포함된 최신 버전입니다.

## 배포

1. GitHub에 `paul-missionary-journeys` 공개 저장소를 만듭니다.
2. 이 폴더 안의 파일을 저장소 루트에 업로드합니다. `index.html`이 최상위에 있어야 합니다.
3. **Settings → Pages → Build and deployment → Deploy from a branch**를 선택합니다.
4. `main` 브랜치의 `/ (root)`를 선택하고 Save를 누릅니다.
5. 배포 후 GitHub Pages 설정에 표시되는 Visit site 링크로 접속합니다.

모든 JS·CSS·Worker 경로를 상대 경로로 작성해 프로젝트 하위 경로에서도 작동합니다. 별도 빌드는 필요하지 않습니다.

## 지도 연결

MapLibre와 Worker를 자체 포함합니다. 기본 지도는 OpenFreeMap, 연결 지연 시 대체 지도는 OpenStreetMap입니다. 지도 서비스에는 인터넷 연결이 필요합니다.

Google 지도·위성사진·거리뷰는 API 키 없이 새 창으로 열립니다. 사이트 내부 지도 삽입은 Maps Embed API 키가 필요합니다. `site-config.mjs`의 `GOOGLE_MAPS_EMBED_API_KEY`에 브라우저용 키를 입력한 뒤, Google Cloud에서 Maps Embed API 및 실제 GitHub Pages 도메인 제한을 설정합니다. 서버용 비밀 키는 넣지 마세요.

좌표는 고대 도시의 근사 위치이며, 거리뷰 제공 범위와 촬영 시점은 지역마다 다릅니다.

MapLibre 라이선스: `maplibre-LICENSE.txt`


## 사건 옆 사진과 거리뷰 연결

35개 방문 장소에 도시·유적·인근 지역의 참고 사진을 표시합니다. 사진을 누르면 선택한 도시 좌표의 Google Maps 거리뷰가 새 창으로 열립니다. 사진은 Google 거리뷰 캡처가 아니며 촬영 당시 모습입니다. 루스드라와 더베는 각각 코니아 지역과 카라만 지역 사진이라고 구분해 표시합니다.

사진은 저장소에 포함하므로 API 키 없이 표시됩니다. 저작자와 라이선스는 사진 바로 아래에 표시하고 원본과 이용 조건으로 연결합니다. 전체 출처는 `PHOTO_CREDITS.md`와 `place-photos.mjs`에 있습니다. 사건 숨김과 함께 접히며, 선택 도시가 바뀌면 사진·출처·거리뷰 링크를 함께 바꿉니다.

`site-config.mjs`의 `GOOGLE_STREETVIEW_STATIC_API_KEY`를 설정하면 Google Street View Static API의 실제 거리뷰 사진을 우선 표시합니다. 해당 API를 별도로 활성화하고, 브라우저용 키를 API와 배포 도메인에 제한해야 합니다. 요청별 과금이 적용될 수 있습니다. 이미지 요청 실패 시 현지 참고 사진으로 전환합니다.

Google은 Street View 캡처 재게시를 허용하지 않으므로 캡처 파일을 저장하지 않습니다. 공식 공유 임베드는 API 키 없이 사용할 수 있으나, 작은 썸네일에는 최소 200×200 크기가 맞지 않아 사용하지 않습니다.

- https://about.google/brand-resource-center/products-and-services/geo-guidelines/
- https://developers.google.com/maps/documentation/streetview/overview


## 바다와 육지 구분

기본 지도는 육지 `#897859` / 바다 `#092d49`, 밝은 지도는 육지 `#f0e3c0` / 바다 `#277da8`로 표시합니다. 물 영역의 테두리도 밝게 강조하며, 스타일 전환 후에도 적용됩니다. 대체 지도는 지형색을 유지하도록 채도·밝기를 조정했습니다.
