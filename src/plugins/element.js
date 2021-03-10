import Vue from 'vue'
import { Button,
    Form,
    FormItem,
    Input,
    Row,
    Message,
    Container,
    Header,
    Aside,
    Main,
    Menu,
    Submenu,
    MenuItem,
    MenuItemGroup,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    Col,
    Table,
    TableColumn,
    Switch,
    Tooltip,
    Pagination,
    Dialog,
    MessageBox,
    Tag,
    Tree,
    Select,
    Option,
    Cascader,
    Alert,
    Tabs,
    TabPane,
    Steps,
    Step,
    Checkbox,
    CheckboxGroup,
    Upload,
    Timeline,
    TimelineItem
} from 'element-ui'

Vue.use(Timeline);
Vue.use(TimelineItem);
Vue.use(Upload);
Vue.use(CheckboxGroup);
Vue.use(Checkbox);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Alert);
Vue.use(Cascader);
Vue.use(Option);
Vue.use(Select);
Vue.use(Tree);
Vue.use(Tag);
Vue.use(Dialog);
Vue.use(Pagination);
Vue.use(Tooltip);
Vue.use(Switch);
Vue.use(TableColumn);
Vue.use(Table);
Vue.use(Col);
Vue.use(Card);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Row);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);

Vue.prototype.$message=Message;
Vue.prototype.$confirm=MessageBox.confirm;

/*Vue.component(Button.name, Button);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Input.name, Input);*/
