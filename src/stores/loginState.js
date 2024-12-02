import { defineStore } from 'pinia';
import axios from 'axios';

export const useLoginState = defineStore('loginState', {
  state: () => ({
    isLoggedIn: false, // 로그인 상태
    adminName: '',     // 관리자 이름
    adminTeam: '',     // 관리자 부서
    adminCode: '',     // 관리자 코드
    exp: '',           // 토큰 만료 시간
  }),
  actions: {
    // 로그인 상태 확인
    async fetchLoginState() {
      try {
        const response = await axios.get('http://localhost:5000/admin/status', {
          withCredentials: true,
        });
        this.isLoggedIn = true;
        this.adminName = response.data.name;
        this.adminTeam = response.data.adminDepartment;
        this.adminCode = response.data.code;
        this.exp = response.data.exp;
        console.log('토큰 만료시간:', this.exp);
      } catch (error) {
        console.error('로그인 상태를 확인할 수 없습니다:', error);
        this.resetState();
      }
    },

    // 로그아웃 처리
    async logout() {
      try {
        await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
        this.resetState();
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
    },

    // 토큰 갱신 처리
    async refreshToken() {
      try {
        const response = await axios.post(
          'http://localhost:5000/auth/refresh',
          {}, // 요청 본문 (필요 시 수정)
          { withCredentials: true } // 쿠키 포함
        );
        console.log('토큰 갱신 성공:', response.data);
        await this.fetchLoginState(); // 갱신된 상태 재확인
      } catch (error) {
        console.error('토큰 갱신 실패:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
          alert('토큰 갱신 실패: 다시 로그인하세요.');
          await this.logout();
        }
      }
    },

    // 상태 초기화
    resetState() {
      this.isLoggedIn = false;
      this.adminName = '';
      this.adminTeam = '';
      this.adminCode = '';
      this.exp = '';
    },
  },
});
