import React, { Component } from "react";
import { ImagePicker, WingBlank, Button, Toast } from "antd-mobile";
import PropTypes from "prop-types";
import { connect } from "dva";
@connect(({ app }) => ({ app }))
class Avatar extends Component {
  constructor() {
    super();
    this.state = {
      avatarList: [],
      filesObj: {},
      isShowBtn: false
    };
  }
  componentDidMount() {
    const {user}=this.props.app
    this.setState({
      avatarList: [
        {
          url:
             user.avatar
              ? user.avatar
              : require("assets/img/default-avatar.jpeg")
        }
      ]
    });
  }
  upload = async () => {
    const {user,dispatch}=this.props

    const url = window.$api.user.uploadAvatar;
    let formdata = new FormData();
    await formdata.append("file", this.state.filesObj.file);
    try {
      const res = await window.$apiServer.post_formdata(url, { formdata });
      Toast.info("上传成功");
      dispatch({type:'app/changeUser',payload:Object.assign({}, user, { avatar: res.data.url })})
    } catch (err) {
      window.$commonErrorHandler(url)(err);
    }
  };
  onChange = async (files, type, index) => {
    console.log(files, type, index);
    const op = {
      remove: async () => {
        let _temp = this.state.avatarList;
        _temp.splice(index, 1);
        this.setState({ avatarList: _temp, isShowBtn: false });
      },
      add: async () => {
        this.setState({
          avatarList: [
            {
              url: files[0].url
            }
          ],
          filesObj: files[0],
          isShowBtn: true
        });
      }
    };
    op[type]();
  };
  render() {
    const { avatarList, isShowBtn } = this.state;
    const btn = (() => (
      <div
        style={{
          position: "fixed",
          bottom: ".2rem",
          left: ".2rem",
          right: ".2rem"
        }}
      >
        <Button
          type="primary"
          className="am-button-borderfix"
          onClick={this.upload}
          style={{ color: "#fff" }}
        >
          提交
        </Button>
      </div>
    ))();
    return (
      <div className="avatar-page">
        <WingBlank>
          <ImagePicker
            files={avatarList}
            onChange={this.onChange}
            onImageClick={(index, fs) => console.log(index, fs)}
            selectable={!avatarList.length}
          />
        </WingBlank>
        {isShowBtn ? btn : null}
      </div>
    );
  }
}
Avatar.propTypes = {
  dispatch: PropTypes.func,
  app: PropTypes.object
};
export default (Avatar);
