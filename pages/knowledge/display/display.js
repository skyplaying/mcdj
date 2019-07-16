import mc from '/others/js/weui_mc';

const app = getApp();

Page({
  data: {
    questionArr: [{
      content: '幼犬一天喂食次数',
      options: ['1-2次', '3-4次', '5-6次', '7-8次'],
      answer: 0,
    }, {
      content: '幼犬一天喂食次数',
      options: ['1-2次', '3-4次', '5-6次', '7-8次'],
      answer: 1,
    }, {
      content: '幼犬一天喂食次数',
      options: ['1-2次', '3-4次', '5-6次', '7-8次'],
      answer: 2,
    },],
    answerArr: ['A', 'B', 'C', 'D'],

    showIndex: 0,
    rightNum: 0,
    errNum: 0,

    time: 80,
  },

  onLoad() {
    const that = this;
    app.doLogin(function (userInfo) {
      that.setData({ userInfo })
      that.queryQuestionArr();
    })
  },

  start() {
    const that = this;
    if (this.data.userInfo.currSurplusCount) {
      const timer = setInterval(function () {
        const time = that.data.time - 1;
        that.setData({ time });
        if (time == 0) {
          clearInterval(timer)
          that.submitExam();
          that.setData({ isShowEnd: true })
        }
      }, 1000);
      this.setData({ isHiddenStart: true, timer })
    } else {
      my.navigateBack();
    }
  },
  hiddenStart() {
    this.setData({ isHiddenStart: true })
    my.navigateBack();
  },

  selectOption(e) {
    const index = e.currentTarget.dataset.index;
    let showIndex = this.data.showIndex;
    if (index == this.data.questionArr[showIndex].answer) {
      const rightNum = this.data.rightNum + 1;
      this.setData({ rightNum });
    } else {
      const errNum = this.data.errNum + 1;
      this.setData({ errNum });
    }
    showIndex = showIndex + 1;

    if (showIndex == this.data.questionArr.length) {
      const timer = this.data.timer;
      clearInterval(timer);
      this.submitExam();
      this.setData({ isShowEnd: true })
    } else
      this.setData({ showIndex })
  },

  restart() {
    if (this.data.userInfo.currSurplusCount) {
      this.setData({ showIndex: 0, rightNum: 0, errNum: 0, isShowEnd: false, time: 80 })
      this.start()
    } else {
      my.navigateBack();
    }
  },

  back() {
    my.navigateBack();
  },

  // 上传答题分数
  submitExam() {
    const that = this;
    const examResultScore = this.data.rightNum;
    mc.submitExam(function () {
      app.doLogin(function (userInfo) {
        that.setData({ userInfo })
        that.queryQuestionArr();
      }, 1)
    }, examResultScore)
  },

  // 获取知识题库
  queryQuestionArr() {
    const that = this;
    const answerArr = this.data.answerArr;
    mc.querySubjectList(function (list) {
      for (let i in list) {
        const answer = answerArr.indexOf(list[i].subjectAnswer);
        list[i].answer = answer;
      }
      console.log(list);
      that.setData({ questionArr: list })
    })
  },



});
