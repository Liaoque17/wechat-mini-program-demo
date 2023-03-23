const regeneratorRuntime = require('../../../lib/runtime'); // eslint-disable-line
const dao = require('../../../dao/index')

Component({
  data: {
    loading: true,
    playlists: [],
    newSongList: [],
    mvList: [],
    djList: [],
  },
  lifetimes: {
    attached() {
      this.initData()
    }
  },
  methods: {
    async initData() {
      try {
        const [playlists, newSongList, mvList, djList] = await Promise.all([
          dao.getRecommendPlaylists(),
          dao.getRecommendNewSong(),
          dao.getRecommendMV(),
          dao.getRecommendDJ()
        ])
        this.setData({
          loading: false,
          playlists: playlists.slice(0,6),
          newSongList: newSongList.slice(0,6),
          mvList: mvList.slice(0,6),
          djList: djList.slice(0,6),
        })
      } catch (e) {
        wx.showToast({
          icon: 'none',
          duration: 1500,
          title: '获取数据失败, 请稍后重试'
        });
      }
    },
  },
})
