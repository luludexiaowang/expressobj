import Vue from 'vue';
import VueRouter from 'vue-router';
import Editor from 'view/editor';
import WorkflowDetail from 'view/workflow-detail';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [{
    path: '/editor',
    component: Editor,
  }, {
    path: '/workflow-detail',
    component: WorkflowDetail,
  }, {
    path: '/',
    redirect: '/editor',
  }],
});
export default router;
