<template>
  <div :class="$style.root">
    <div :class="$style.area">
      <User :user="createdBy" :time="formatedCreatedAt" :currentUid="currentUid" @edit="edit" v-if="createdBy"/>
      <template v-if="relationType">
        <div :class="$style.desc" v-if="!relation">
          添加了 工作进展
        </div>
        <div :class="$style.desc" v-else>
          添加了
          <span v-if="relationType==='COMPANY'">项目 <a href="javascript:void(0);" v-tap="{methods:routeCompany}">{{relation.relationName}}</a></span>
          <span v-else>基金 {{relation.relationName}}</span>
          的工作进展
        </div>
      </template>
      <div :class="$style.content" class="ql-editor-result" v-html="content.html" v-if="content"/>
      <div :class="$style.loc" v-if="location&&location.title&&location.address">
        <img src="./asset/icon_accessory small.png"/>
        <span>
          {{`${location.title}·${location.address}`}}
        </span>
      </div>
      <div :class="$style.files" v-if="files&&files.files&&files.files.length">
        <div :class="$style.file" :key="index" v-for="file,index in files.files"
             v-tap="{methods:clickFile.bind(null, file)}"
        >
          {{file.name|limit}}
          <img :src="getFileIcon(file.name)"/>
        </div>
      </div>
    </div>
    <div :class="$style.area" v-if="commentList.length" :style="{padding: 0}">
      <div :class="$style.head" :style="{marginTop:'0'}">
        评论
        <span :class="$style.num">{{commentList.length}}</span>
      </div>
      <Comment
        :key="index"
        :data="comment"
        @click="clickComment(comment)"
        v-for="comment,index in commentList"
        :class="index===0&&'no-border'"
      />
    </div>
  </div>
</template>
<script>
  /* eslint-disable no-unused-vars,no-control-regex */
  import Bridge from '../../../wrapper/native';
  import User from './user.vue';
  import Comment from './comment.vue';

  const bridge = Bridge.getInstance();
  const GLOBAL_ENTRY_NAME = 'NATIVE_ENTRY';

  export default{
    mixins: [],
    props: {},
    components: {
      User,
      Comment,
    },
    filters: {
      limit: (value) => {
        const limit = 20;
        if (!value) return '';
        let suffix = value.match(/\.(\S+)$/);
        if (suffix) {
          value = value.substring(0, suffix.index);
          [suffix] = suffix;
        } else {
          suffix = '';
        }
        let len = 0;
        let i = 0;
        for (; i < value.length; i += 1) {
          const ch = value[i];
          len += /[^\x00-\xff]/.test(ch) ? 2 : 1;
          if (len > limit) {
            break;
          }
        }
        if (i < value.length - 1) {
          return `${value.substring(0, i)}...${suffix}`;
        }
        return `${value}${suffix}`;
      },
    },
    data() {
      return {
        imgs: {
          icon_document_excel: require('./asset/icon_document_excel.png'),
          icon_document_img: require('./asset/icon_document_img.png'),
          icon_document_number: require('./asset/icon_document_number.png'),
          icon_document_pdf: require('./asset/icon_document_pdf.png'),
          icon_document_ppt: require('./asset/icon_document_ppt.png'),
          icon_document_rar: require('./asset/icon_document_rar.png'),
          icon_document_txt: require('./asset/icon_document_txt.png'),
          icon_document_unknown: require('./asset/icon_document_unknown.png'),
          icon_document_word: require('./asset/icon_document_word.png'),
        },
        id: '',
        uid: '',
        relationUserType: '',
        progressId: '',
        createdBy: null,
        relationType: '',
        relation: null,
        contentType: '',
        content: null,
        files: null,
        location: null,
        createdAt: '',
        formatedCreatedAt: '',
        commentList: [],
        currentUid: '',
      };
    },
    computed: {},
    created() {
      window.inApp = true;
      window[GLOBAL_ENTRY_NAME] = (method, ...args) => {
        const func = this[method];
        if (typeof func === 'function') {
          return func.apply(this, args);
        }
        return undefined;
      };
    },
    beforeDestroy() {
      window[GLOBAL_ENTRY_NAME] = null;
    },
    mounted() {
      bridge.route('onReady');
      /* eslint-disable no-eval,max-len */
    //      eval('window.NATIVE_ENTRY("assign",{"contentType":"USER_PUBLIC","backgroundColor":"#5D9CEC","createdAt":"2018-01-04 15:42:36","relation":{"relationName":"啊啊啊","relationId":"936b138199d2488d95da76c1ac889622"},"content":{"at":[],"html":"<ul><li>djsj的多<\\/li><li>得多<\\/li><\\/ul>","delta":[{"insert":"djsj的多"},{"attributes":{"list":"bullet"},"insert":"\\n"},{"insert":"得多"},{"attributes":{"list":"bullet"},"insert":"\\n"}],"type":"RTE","pure":"djsj的多\\n得多\\n"},"files":"{\\"files\\":[{\\"fileId\\":\\"a5c0460d78d64c6199c209034592dd6e\\",\\"name\\":\\"[税务此款款]商业计划书.pdf\\",\\"url\\":\\"https:\\/\\/vcsaasdev.36kr.com\\/api\\/download\\/a5c0460d78d64c6199c209034592dd6e\\/%5B%E7%A8%8E%E5%8A%A1%E6%AD%A4%E6%AC%BE%E6%AC%BE%5D%E5%95%86%E4%B8%9A%E8%AE%A1%E5%88%92%E4%B9%A6\\"},{\\"fileId\\":\\"b578790b2c8d47948837ec38337b7f4a\\",\\"name\\":\\"[税务此款款]商业计划书.pdf\\",\\"url\\":\\"https:\\/\\/vcsaasdev.36kr.com\\/api\\/download\\/b578790b2c8d47948837ec38337b7f4a\\/%5B%E7%A8%8E%E5%8A%A1%E6%AD%A4%E6%AC%BE%E6%AC%BE%5D%E5%95%86%E4%B8%9A%E8%AE%A1%E5%88%92%E4%B9%A6\\"},{\\"fileId\\":\\"578966019af449b4a1de1f642ac99955\\",\\"name\\":\\"krTou_42103892_diqymn81n880kcl0.pdf\\",\\"url\\":\\"https:\\/\\/vcsaasdev.36kr.com\\/api\\/download\\/578966019af449b4a1de1f642ac99955\\/krTou_42103892_diqymn81n880kcl0\\"},{\\"fileId\\":\\"84f248f02798416e9085b26fb9f3e3f2\\",\\"name\\":\\"[IU%E5%AE%9D%E8%B4%9D%E7%9C%BC]%E5%95%86%E4%B8%9A%E8%AE%A1%E5%88%92%E4%B9%A6.pdf\\",\\"url\\":\\"https:\\/\\/vcsaasdev.36kr.com\\/api\\/download\\/84f248f02798416e9085b26fb9f3e3f2\\/%5BIU%25E5%25AE%259D%25E8%25B4%259D%25E7%259C%25BC%5D%25E5%2595%2586%25E4%25B8%259A%25E8%25AE%25A1%25E5%2588%2592%25E4%25B9%25A6\\"}],\\"skipValidateCmd\\":false}","location":{"lng":116.300079,"title":"万泉河桥","lat":39.984951000000002,"address":"北京市海淀区北四环西路辅路与万泉河路交叉口东北"},"commentList":[{"formatedCreatedAt":"15:42","createdBy":{"avatar":"","name":"罗娜","backgroundColor":"#5D9CEC","uid":"595177f83a5a44138e611ce2cf044d5a"},content:[{content:{text:"123"}}]}],"id":9188,"currentUid":"595177f83a5a44138e611ce2cf044d5a","formatedCreatedAt":"15:42","createdBy":{"avatar":"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1516598786290&di=f7cc322279af93cd18ad0e475ed6b4f2&imgtype=0&src=http%3A%2F%2Fp1.qqyou.com%2Ftouxiang%2FUploadPic%2F2015-4%2F15%2F201504151133475846.jpg","name":"罗娜","backgroundColor":"#5D9CEC","uid":"595177f83a5a44138e611ce2cf044d5a"},"progressId":"d58f8aece8c5413d95d5d707427e94ac","relationType":"COMPANY"})');
    //      window.NATIVE_ENTRY('assign', JSON.parse('{"contentType":"USER_PUBLIC","backgroundColor":"#5D9CEC","createdAt":"2018-01-18 15:02:51","content":{"at":[],"html":"<p><br><\\/p><table table_id=\\"cee0f613\\"><tr table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\"><td table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\" td_id=\\"489730b3\\" td_count=\\"2\\" style=\\"width: 50%;\\"><p class=\\"td-start\\" table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\" td_id=\\"489730b3\\" td_count=\\"2\\"><br><\\/p><p>1<\\/p><p class=\\"td-end\\" table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\" td_id=\\"489730b3\\" td_count=\\"2\\"><br><\\/p><\\/td><td table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\" td_id=\\"f81ea984\\" td_count=\\"2\\" style=\\"width: 50%;\\"><p class=\\"td-start\\" table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\" td_id=\\"f81ea984\\" td_count=\\"2\\"><br><\\/p><p>1<\\/p><p class=\\"td-end\\" table_id=\\"cee0f613\\" tr_id=\\"3694c2e9\\" td_id=\\"f81ea984\\" td_count=\\"2\\"><br><\\/p><\\/td><\\/tr><tr table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\"><td table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\" td_id=\\"55a1ca08\\" td_count=\\"2\\" style=\\"width: 50%;\\"><p class=\\"td-start\\" table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\" td_id=\\"55a1ca08\\" td_count=\\"2\\"><br><\\/p><p>1<\\/p><p class=\\"td-end\\" table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\" td_id=\\"55a1ca08\\" td_count=\\"2\\"><br><\\/p><\\/td><td table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\" td_id=\\"388f68cb\\" td_count=\\"2\\" style=\\"width: 50%;\\"><p class=\\"td-start\\" table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\" td_id=\\"388f68cb\\" td_count=\\"2\\"><br><\\/p><p>1<\\/p><p class=\\"td-end\\" table_id=\\"cee0f613\\" tr_id=\\"efec1c3c\\" td_id=\\"388f68cb\\" td_count=\\"2\\"><br><\\/p><\\/td><\\/tr><\\/table><p><br><\\/p>","delta":[{"insert":"\\n"},{"attributes":{"td_start":"cee0f613|3694c2e9|489730b3|2"},"insert":"\\n"},{"insert":"1\\n"},{"attributes":{"td_end":"cee0f613|3694c2e9|489730b3|2"},"insert":"\\n"},{"attributes":{"td_start":"cee0f613|3694c2e9|f81ea984|2"},"insert":"\\n"},{"insert":"1\\n"},{"attributes":{"td_end":"cee0f613|3694c2e9|f81ea984|2"},"insert":"\\n"},{"attributes":{"td_start":"cee0f613|efec1c3c|55a1ca08|2"},"insert":"\\n"},{"insert":"1\\n"},{"attributes":{"td_end":"cee0f613|efec1c3c|55a1ca08|2"},"insert":"\\n"},{"attributes":{"td_start":"cee0f613|efec1c3c|388f68cb|2"},"insert":"\\n"},{"insert":"1\\n"},{"attributes":{"td_end":"cee0f613|efec1c3c|388f68cb|2"},"insert":"\\n"},{"attributes":{"header":7},"insert":"\\n"}],"type":"RTE","pure":"\\n\\n1\\n\\n\\n1\\n\\n\\n1\\n\\n\\n1\\n\\n\\n"},"files":"{\\"files\\":[],\\"skipValidateCmd\\":false}","location":{},"commentList":[],"id":16851,"currentUid":"595177f83a5a44138e611ce2cf044d5a","formatedCreatedAt":"15:02","createdBy":{"avatar":"https:\\/\\/vcsaasdev.36kr.com\\/api\\/download\\/e39f4ec26a34427485ef5b68bf6f83b5","name":"Admin","backgroundColor":"#5D9CEC","uid":"595177f83a5a44138e611ce2cf044d5a"},"progressId":"ef7207cb271e44598fe853265d25797c","relationType":"NONE"}'));
    },
    methods: {
      getFileIcon(name) {
        let result = 'icon_document_unknown';
        if (name) {
          const match = name.match(/\.(\S+)$/);
          if (match) {
            const suffix = match[1].toLowerCase();
            switch (suffix) {
              case 'png':
              case 'jpg':
              case 'gif':
                result = 'icon_document_img';
                break;
              case 'doc':
              case 'docx':
              case 'pages':
                result = 'icon_document_word';
                break;
              case 'xls':
              case 'xlsx':
                result = 'icon_document_excel';
                break;
              case 'ppt':
              case 'pptx':
              case 'key':
                result = 'icon_document_ppt';
                break;
              case 'numbers':
                result = 'icon_document_number';
                break;
              case 'pdf':
                result = 'icon_document_pdf';
                break;
              case 'rar':
              case 'zip':
                result = 'icon_document_ppt';
                break;
              case 'txt':
                result = 'icon_document_txt';
                break;
              default:
            }
          }
        }
        return this.imgs[result];
      },
      assign(data) {
        Object.keys(data)
          .forEach(key => {
            if (key === 'files' && typeof data[key] === 'string') {
              try {
                data[key] = JSON.parse(data[key]);
              } catch (e) {
                data[key] = {};
              }
            }
            this[key] = data[key];
          });
        this.$forceUpdate();
      },
      addComments(comments) {
        this.commentList = this.commentList.concat(comments);
      },
      edit() {
        bridge.route('onEdit', this.id, this.progressId);
      },
      routeCompany() {
        bridge.route('onGoToCompany', this.relation.relationId);
      },
      clickFile(file) {
        bridge.route('onClickFile', file);
      },
      clickComment(comment) {
        bridge.route('onClickComment', comment);
      },
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~style/common.less";
  @import '../editor/editor/rte/index.less';

  .root {
    width: 100%;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    background-color: #f6f6f6;
    font-family: "PingFang SC";

    .area {
      margin-bottom: @lessSpace;
      padding: @normalSpace;
      background-color: white;

      .desc {
        font-size: @normalFontSize;
        line-height: unit(22/@basicFontSize, rem);
        color: @darkColor;
        margin-top: @lessSpace;
      }

      .head {
        .desc;
        padding: @normalSpace 0;
        padding-left: @normalSpace;
        .num {
          margin-left: @miniSpace;
          color: @lightColor;
        }
        position: relative;
        &::after{
          .half-border;
          border-bottom: @normalBorder;
        }
      }
      .content {
        margin: @lessSpace 0;
        padding: 0;
        height: auto;
      }
      .loc {
        font-size: @miniFontSize;
        color: @lightColor;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        line-height: 1.3;
        vertical-align: middle;

        img{
          height: 1em;
          vertical-align: middle;
        }
        span{
          vertical-align: middle;

        }
      }
      .files {
        background-color: #F6F6F6;
        border-radius: @miniRadius;
        margin-top: @lessSpace;
        overflow: hidden;

        .file {
          @h: unit(20/@basicFontSize, rem);
          @imgW: unit(30/@basicFontSize, rem);
          font-size: @normalFontSize;
          color: @darkColor;
          line-height: @h;
          position: relative;
          padding: @normalSpace 0;
          padding-left: @imgW+@lessSpace+@lessSpace;
          padding-right: @lessSpace;
          min-height: @h;
          // border-bottom: @normalBorder;
          word-break: break-all;

          &::after{
            .half-border;
            border-bottom: @normalBorder;
          }

          img {
            width: @imgW;
            height: @imgW;
            position: absolute;
            left: @lessSpace;
            top: 50%;
            transform: translate(0, -50%);
          }
        }
      }
    }
  }
</style>
