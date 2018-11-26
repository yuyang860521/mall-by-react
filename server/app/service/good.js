const { Service } = require("egg");
class HomeService extends Service {
  async getHotGoods() {
    const { ctx } = this;
    return ctx.model.Good.findAll({
      where: {
        isHot: 1
      }
    });
  }
  async getNewGoods() {
    const { ctx } = this;
    return ctx.model.Good.findAll({
      where: {
        isNew: 1
      }
    });
  }
  async getGoodDetail() {
    const { ctx } = this;
    const { goodId } = ctx.params;
    const { token } = ctx.query;
    let good = await ctx.model.Good.findOne({
      raw: true,
      where: {
        goodId: goodId
      }
    });
    let result = await ctx.service.token.verifyToken(token);
    if (result) {
      let { userid } = result;
      let res = await ctx.model.Collect.findOne({
        raw: true,
        where: { userid, goodId }
      });
      if (res) {
        let { isCollect } = res;
        return Promise.resolve(Object.assign(good, { isCollect }));
      } else {
        return Promise.resolve(good);
      }
    } else {
      return Promise.resolve(good);
    }
  }
  async collectGood() {
    const { ctx } = this;
    const { goodId } = ctx.params;
    const { isCollect, token } = ctx.request.body;
    const data = await ctx.service.token.verifyToken(token);
    const { userid } = data;
    let flag = await ctx.model.Collect.findOne({
      where: {
        goodId,
        userid
      }
    });
    if (flag) {
      return ctx.model.Collect.update(
        {
          isCollect
        },
        {
          where: { goodId, userid }
        }
      );
    } else {
      return ctx.model.Collect.create({
        goodId,
        userid,
        isCollect
      });
    }
  }
  async getCollectGood() {
    const { ctx } = this;
    const { token } = ctx.query;
    const data = await ctx.service.token.verifyToken(token);
    const { userid } = data;
    let arr = await ctx.model.Collect.findAll({
      raw: true,
      where: { userid }
    });
    arr = arr.filter(item => item.isCollect);
    const assGood = async arr => {
      let result = [];
      for (let item of arr) {
        const good = await ctx.model.Good.findOne({
          raw: true,
          where: { goodId: item.goodId }
        });
        item = Object.assign({}, good, item);
        result.push(item);
      }
      return result;
    };

    return assGood(arr);
  }
  async getGoodComment() {
    const { ctx } = this;
    const { goodId } = ctx.params;
    const res = await ctx.model.Comments.findAll({
      raw: true,
      where: {
        goodId
      }
    });
    return res;
  }
  async addGoodComment() {
    const { ctx } = this;
    const { goodId } = ctx.params;
    const data=await ctx.service.upload.upload()
    const { isAnonymous, urlList, comment, rate,userid } = data ;
    console.log(data)
    let res
    if (isAnonymous-0) {
    res=  await ctx.model.Comments.create({
        goodId,
        comment,
        name: "火星用户",
        imgList:JSON.stringify(urlList),
        rateScore: rate
      });
    } else {
      const { userid } = data;
      const userInfo = await ctx.model.User.findOne({
        raw: true,
        where: { userid }
      });
     res= await ctx.model.Comments.create({
        goodId,
        comment,
        imgList:JSON.stringify(urlList),
        rateScore: rate,
        name: userInfo.username,
        avatar: userInfo.avatar
      });
    }
    return res;
  }
  async getGoodByCateId() {
    const { ctx } = this;
    const { cateId } = ctx.query;
    return ctx.model.Good.findAll({
      where: {
        cateId: cateId
      }
    });
  }
  async searchGood() {
    const { ctx } = this;
    const { keyword } = ctx.query;
    return ctx.model.Good.findAll({
      where: {
        $or: {
          cate: {
            $like: `%${keyword}%`
          },
          goodName: {
            $like: `%${keyword}%`
          }
        }
      }
    });
  }
  // async getAllGoods() {
  //   try {
  //     const res = await this.ctx.service.category.getAllCategory();
  //     res.data.map(item => {
  //       item.cateId;
  //     });
  //     this.success();
  //   } catch (err) {
  //     this.fail(err);
  //   }
  // }
}
module.exports = HomeService;
