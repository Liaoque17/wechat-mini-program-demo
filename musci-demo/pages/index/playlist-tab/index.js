const regeneratorRuntime = require('../../../lib/runtime'); // eslint-disable-line
const dao = require('../../../dao/index')

const LIMIT = 20

Component({
  data: {
    hasMore: true, // 用于判断是否拉取结束
    playlists: [],
    showLoading: false,
    offset: 0,
    // 歌单分类
    showCategory: false,
    categoryList: [],
    subCategoryMap: {},
    selectedCategory: '全部歌单'
  },
  lifetimes: {
    attached() {
      this.fetchPlaylist()
      this.fetchCategory()
    }
  },
  methods: {
    async fetchPlaylist() {
      this.setData({
        showLoading: true
      })
      try {
        const response = await dao.getPlaylistByCategory(this.data.selectedCategory, this.data.offset, LIMIT)
        const newPlaylists = response.playlists
        const newData = {
          hasMore: response['more'],
        }
        if (newPlaylists) {
          newData.playlists = this.data.playlists.concat(newPlaylists)
          this.data.offset = newData.playlists.length
        }
        this.setData(newData)
      } catch (e) {
        console.error(e)
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '获取歌单信息失败'
        })
      }
      this.setData({
        showLoading: false
      })},
    onReachBottom() {
      this.fetchPlaylist()
    },
    async fetchCategory() {
      try {
        const response = await dao.getPlaylistCategory()
        const categories = response['categories']
        const categoryList = []
        for (let categoryId of Object.keys(categories)) { // 构造大分类ID的列表
          categoryList.push(categories[categoryId])
        }
        const subCategories = response['sub']
        const subCategoryMap = {}
        for (let category of subCategories) { // 遍历子分类列表, 将同一大分类下的子分类划分到一个数组中
          const categoryId = category.category
          if (!subCategoryMap[categoryId]) {
            subCategoryMap[categoryId] = []
          }
          subCategoryMap[categoryId].push(category) // 通过大分类ID进行分组
        }
        this.setData({
          categoryList,
          subCategoryMap
        })
      } catch (e) {
        console.error(e)
        wx.showToast({
          icon: 'none',
          duration: 1500,
          title: '获取歌单分类失败'
        });
      }
    },
    async switchCategory(newCategory) {
      this.data.playlists = []
      this.data.offset = 0
      this.setData({
        selectedCategory: newCategory,
        showCategory: false
      }, () => {
        this.fetchPlaylist()
      })
    },
    onClickAllCategory() {
      this.setData({
        showCategory: true
      })
    },
    onClickClose() {
      this.setData({
        showCategory: false
      })
    },
    onClickCategory(e) {
      const categoryName = e.currentTarget.dataset['category']
      this.switchCategory(categoryName)
    },
    onClickPlaylist(e){
      const playlistId = e.currentTarget.dataset['playlistId']
      wx.navigateTo({
        url: `../playlist/index?playlistId=${playlistId}`
      })
    }
  },
})
