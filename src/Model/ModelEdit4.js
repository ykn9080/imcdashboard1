import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import _, { random } from "lodash";
import { globalVariable } from "actions";
import { loadCSS } from "fg-loadcss";
import {
  Row,
  Col,
  Typography,
  Button,
  Radio,
  Modal,
  Tooltip,
  Popover,
  Popconfirm,
  message,
  Select,
  Menu,
  Dropdown,
} from "antd";
import GridLay1 from "components/Common/ReactGridLayout1";
import "components/Common/react-grid-layout.css";
import { pick } from "components/functions/LodashUtil";
import {
  FileAddOutlined,
  EditOutlined,
  RollbackOutlined,
  SaveOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  FcMindMap,
  FcBarChart,
  FcLineChart,
  FcScatterPlot,
  FcCloseUpMode,
  FcPieChart,
} from "react-icons/fc";
import { ImTable } from "react-icons/im";
import IconArray1 from "components/SKD/IconArray1";
import { MainMaker } from "Model/ModelRun";

const { Title } = Typography;
const { Option } = Select;

const ModelEdit4 = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [fullscreen, setFullscreen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [popvisible, setPopvisible] = useState(false);
  const [colnum, setColnum] = useState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [tempLayout, setTempLayout] = useState();
  const [selectChart, setSelectChart] = useState();

  const [child, setChild] = useState();
  const [defaultlist, setDefaultlist] = useState();

  let tempModel = useSelector((state) => state.global.tempModel);
  let tempData = useSelector((state) => state.global.tempData);
  let currentStep = useSelector((state) => state.global.currentStep);
  let trigger = useSelector((state) => state.global.triggerChild);

  if (!tempData) {
    dispatch(globalVariable({ currentStep: currentStep - 1 }));
    message.loading({
      content: "Data fetching, please wait...",
      style: {
        marginTop: "10vh",
      },
      duration: 2,
    });

    setTimeout(function () {
      dispatch(globalVariable({ nextStep: currentStep }));
    }, 1500);
  }
  useEffect(() => {
    localStorage.removeItem("tempAuthor");
  }, []);
  useEffect(() => {
    let tempAuthor = localStorage.getItem("tempAuthor");
    let tempAuthor1 = tempModel?.properties?.resultsAuthor;
    if (tempAuthor1 && tempAuthor1.length === 0) {
      createMain(tempModel);
    }
    if (!_.isEqual(JSON.parse(tempAuthor), tempAuthor1)) {
      const author1 = JSON.stringify(tempModel?.properties?.resultsAuthor);
      let author;
      if (author1) author = JSON.parse(author1);
      localStorage.setItem("tempAuthor", JSON.stringify(author));

      let rAuthor = mergeDtlist();

      let lay = _.filter(rAuthor, {
        checked: true,
      });

      lay.sort(function (a, b) {
        return parseInt(a.i) - parseInt(b.i);
      });

      dispatch(globalVariable({ tempModel }));
      console.log(lay);
      setTempLayout(lay);

      modalInit();
      const node = loadCSS(
        "https://use.fontawesome.com/releases/v5.12.0/css/all.css",
        document.querySelector("#font-awesome-css")
      );
      return () => {
        node.parentNode.removeChild(node);
      };
    }
  }, [tempModel]);

  useEffect(() => {
    let lay = tempLayout;
    if (lay) {
      setTempLayout(null);
      lay.sort(function (a, b) {
        return parseInt(a.i) - parseInt(b.i);
      });
      if (colnum === -1) {
        //reset
        reverttempModel();
        return false;
      }
      let cnum = 12 / colnum;
      lay.map((k, i) => {
        k.w = cnum;
        //k.h = cnum * 3;
        k.x = (i % colnum) * cnum;
        k.y = parseInt(i / colnum) * cnum;
        lay.splice(i, 1, k);
        return null;
      });
      setTempLayout(lay);
      let newtempModel = { ...tempModel };
      newtempModel.properties.resultsAuthor = lay;
      dispatch(globalVariable({ tempModel: newtempModel }));
      dispatch(globalVariable({ currentStep: 3 }));
      dispatch(globalVariable({ nextStep: 4 }));
    }
  }, [colnum]);
  const createMain = (tempModel) => {
    if (!tempModel) return false;
    const src = tempModel?.properties?.source;
    const author = tempModel?.properties?.resultsAuthor;
    if (author) {
      const maincontent = MainMaker(src);
      tempModel.properties.resultsAuthor.push(maincontent);
      dispatch(globalVariable({ tempModel }));
    }
  };
  const goback = [
    {
      tooltip: "Go to Previous",
      awesome: "expand-arrows-alt",
      fontSize: "small",
      color: "inherit",
      "aria-controls": "back",
      onClick: () => setFullscreen(!fullscreen),
    },
  ];
  let items = [];
  let result = tempModel?.properties?.results;
  if (!result) result = {};
  const namelist = Object.keys(result);
  namelist.map((k, i) => {
    const tt = (
      <div style={{ margin: 10 }}>
        <Row gutter={0} justify="space-between">
          <Col span={23}>
            <Row>
              <Col>
                <Title level={4}>{k}</Title>
              </Col>
              <Col>
                <Button
                  type="link"
                  onClick={() => {
                    history.push("./edit/graph?name=" + k);
                  }}
                  size="small"
                  icon={<EditOutlined />}
                />
              </Col>
            </Row>
          </Col>
          <Col span={1}>
            <div style={{ marginTop: -13, marginLeft: -30 }}>
              <IconArray1 btnArr={goback} />
            </div>
          </Col>
        </Row>
      </div>
    );
    items.push({
      title: k,
      content: tt,
    });
    return null;
  });
  const saveLayout = () => {
    let layout = localStorage.getItem("tempLayout");
    if (layout) {
      layout = JSON.parse(layout);
      let odr = tempModel.properties.resultsAuthor;
      layout.map((k, i) => {
        odr.map((a, b) => {
          if (a.i === k.i) {
            a.x = k.x;
            a.y = k.y;
            a.w = k.w;
            a.h = k.h;
            odr.splice(b, 1, a);
            return null;
          }
          return null;
        });
      });
      localStorage.removeItem("tempLayout");
    }
    dispatch(globalVariable({ tempModel }));
  };
  const saveTemp = (trigger) => {
    if (trigger.length > 0 && trigger[0] === "save") {
      saveLayout();
      dispatch(globalVariable({ triggerChild: [] }));
    }
  };
  if (trigger.length > 0 && trigger[0] === "save") saveTemp(trigger);
  const onLayoutChange = (layout, layouts) => {
    localStorage.setItem("tempLayout", JSON.stringify(layout));
  };
  const saveLayoutChange = (e) => {
    e.stopPropagation();
    saveLayout();
    message
      .loading("Saved to temporary file..", 2)
      .then(() => message.info('press "Save" to server ->', 4));
  };

  const resetLayout = (e) => {
    e.stopPropagation();
    reverttempModel();
  };
  const createItem = (existing) => {
    let num = 0,
      firstrow = 0;
    if (existing) {
      num = _.filter(existing, { checked: true }).length;
      firstrow = _.filter(existing, (o) => {
        return o.y === 0;
      }).length;
    }
    if (firstrow === 0) firstrow = 1;
    let colnum1 = colnum;
    if (!colnum1) colnum1 = firstrow;
    let cnum = 12 / colnum1;
    return {
      x: (num % colnum1) * cnum,
      y: Infinity,
      w: cnum,
      h: cnum * 2,
      i: parseInt(Math.random() * 1000).toString(),
    };
  };
  const addItem = (j) => {
    let odr = tempModel.properties.resultsAuthor;
    const addnew = createItem(odr);

    //x,y,w,h,i: w:6(half), h:6, x:(num%2*6), y:(parseInt(num/2)*6, i:num(sort and assiang index each)
    odr.map((k, i) => {
      if (j.indexOf(k.id) > -1) {
        k = { ...k, checked: true, ...addnew };
        odr.splice(i, 1, k);
      }
      return null;
    });
  };
  const removeItem = (j) => {
    let odr = tempModel.properties.resultsAuthor;
    odr.map((k, i) => {
      if (j.indexOf(k.id) > -1) {
        ["x", "y", "w", "h", "i", "checked"].map((a) => {
          delete k[a];
          return null;
        });
        odr.splice(i, 1, k);
      }
      return null;
    });
    //renumbering after delete
    let filtered = _.filter(odr, { checked: true });
    filtered.sort(function (a, b) {
      return parseInt(a.i) - parseInt(b.i);
    });

    odr.map((k, i) => {
      filtered.map((a, b) => {
        a.i = b.toString();
        if (k.id === a.id) {
          odr.splice(i, 1, a);
        }
        return null;
      });
      return null;
    });
  };
  const onRemoveItem = (i) => {
    let odr = tempModel.properties.resultsAuthor;
    const obj = _.find(odr, { i });
    removeItem(obj.id);
    dispatch(globalVariable({ tempModel }));
    //편법!!, force reload by go back and forth
    dispatch(globalVariable({ currentStep: currentStep - 1 }));
    dispatch(globalVariable({ nextStep: currentStep }));
  };
  const onEditItem = (i) => {
    if (!i) {
      history.push(`./edit/graph`);
      console.log("sssssss");
      return;
    }
    let odr = tempModel.properties.resultsAuthor;
    // let results = tempModel.properties.results;
    const json = _.find(odr, { i });
    // let nodelist = results[json.node];
    // json.nodelist = nodelist;

    history.push(`./edit/author?key=${json.key}`);
  };

  const addBlank = () => {
    let newtempModel = { ...tempModel };
    const author = newtempModel.properties.resultsAuthor;
    let newItem = createItem(author);
    newItem.type = "";
    newItem.i = parseInt(Math.random() * 100).toString();
    newItem.id = parseInt(Math.random() * 100).toString();
    newItem.key = parseInt(Math.random() * 100000).toString();
    newItem.checked = true;
    newItem.setting = { title: `new Item${author.length + 1}` };
    author.push(newItem);
    dispatch(globalVariable({ tempModel: newtempModel }));
    dispatch(globalVariable({ currentStep: currentStep - 1 }));
    dispatch(globalVariable({ nextStep: currentStep }));
    console.log(newtempModel);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    setVisible(false);
    if (selectChart) {
      let newtempModel = { ...tempModel };
      let odr = newtempModel.properties.resultsAuthor;
      let filtered = _.filter(odr, { checked: true });
      let currArr = pick(filtered, "id");
      let removelist = [],
        addedlist = [];
      currArr.map((k, i) => {
        if (selectChart.indexOf(k) === -1) removelist.push(k);
        return null;
      });
      selectChart.map((k, i) => {
        if (currArr.indexOf(k) === -1) addedlist.push(k);
        return null;
      });
      addItem(addedlist);
      removeItem(removelist);
      dispatch(globalVariable({ tempModel: newtempModel }));
      //편법!!, force reload by go back and forth
      dispatch(globalVariable({ currentStep: currentStep - 1 }));
      dispatch(globalVariable({ nextStep: currentStep }));
    }
    setConfirmLoading(false);
  };

  const mergeDtlist = () => {
    let tempAuthor = localStorage.getItem("tempAuthor");
    if (tempAuthor !== "undefined") tempAuthor = JSON.parse(tempAuthor);
    const prosrc = tempModel?.properties?.source;

    if (prosrc && tempModel?.properties?.resultsAuthor) {
      let newAuthor = JSON.parse(
        JSON.stringify(tempModel.properties.resultsAuthor)
      );

      return newAuthor;
    }
  };
  const reverttempModel = () => {
    //reset
    let localAuthor = localStorage.getItem("tempAuthor");
    if (localAuthor) {
      localAuthor = JSON.parse(localAuthor);
      tempModel.properties.resultsAuthor = localAuthor;
      dispatch(globalVariable({ tempModel }));
      dispatch(globalVariable({ currentStep: currentStep - 1 }));
      dispatch(globalVariable({ nextStep: currentStep }));
      localStorage.removeItem("tempAuthor");
    }
  };
  const PopoverContent = () => {
    const handleLayoutChange = (e) => {
      setColnum(e.target.value);
    };

    return (
      <div style={{ marginBottom: 10 }}>
        <Radio.Group value={colnum} onChange={handleLayoutChange}>
          <Radio.Button value="1">1</Radio.Button>
          <Radio.Button value="2">2</Radio.Button>
          <Radio.Button value="3">3</Radio.Button>
        </Radio.Group>
      </div>
    );
  };
  const genExtra = () => (
    <div style={{ textAlign: "right", marginBottom: 5 }}>
      <Tooltip title="Create New1">
        <Button
          icon={<FileAddOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            addBlank();
          }}
        />
      </Tooltip>
      <Tooltip title="Create New">
        <Button
          icon={<PlusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            history.push("./author");
            message.info("Select data for new authoring");
          }}
        />
      </Tooltip>
      <Tooltip title="Deploy Layout">
        <Button
          icon={<AppstoreAddOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setVisible(true);
          }}
        />
      </Tooltip>
      <Tooltip title="Reset Layout">
        <Popconfirm
          title="Are you sure to reset layout?"
          onConfirm={resetLayout}
          okText="Yes"
          cancelText="No"
        >
          <Button icon={<RollbackOutlined />} />
        </Popconfirm>
      </Tooltip>
      <Tooltip title="How many Columns">
        <Popover
          content={
            <>
              <PopoverContent />
              <a
                onClick={(e) => {
                  e.stopPropagation();
                  setPopvisible(false);
                }}
              >
                Close
              </a>
            </>
          }
          title="Select columns"
          placement="leftTop"
          trigger="click"
          visible={popvisible}
          onVisibleChange={(e) => {
            setPopvisible(!popvisible);
          }}
        >
          <Button
            onClick={(e) => e.stopPropagation()}
            icon={<AppstoreOutlined />}
          />
        </Popover>
      </Tooltip>
      <Tooltip title="Save Layout">
        <Button
          icon={<i className="fas fa-save" />}
          onClick={saveLayoutChange}
        />
      </Tooltip>
    </div>
  );
  const laybutton = (
    <Row justify="end">
      <Col offset={21}>
        <Tooltip title="Reset Layout">
          <Button icon={<RollbackOutlined />} onClick={resetLayout} />
        </Tooltip>
      </Col>
      <Col>
        <Tooltip title="How many Columns">
          <Popover
            content={
              <>
                <PopoverContent />
                <a onClick={(e) => setPopvisible(false)}>Close</a>
              </>
            }
            title="Select columns"
            placement="leftTop"
            trigger="click"
            visible={popvisible}
            onVisibleChange={() => setPopvisible(!popvisible)}
          >
            <Button icon={<AppstoreAddOutlined />} />
          </Popover>
        </Tooltip>
      </Col>
      <Col>
        <Tooltip title="Save Layout">
          <Button icon={<SaveOutlined />} onClick={saveLayoutChange} />
        </Tooltip>
      </Col>
    </Row>
  );
  function handleChange(value, e) {
    setSelectChart(value);
  }
  const modalInit = () => {
    const children = [],
      deflist = [];
    const findSource = (key) => {
      let sourcename = "";
      const rtn = _.filter(tempModel.properties.source, (o) => {
        return o.key === key;
      });
      if (rtn) sourcename = rtn.title;
      return sourcename;
    };
    const chartType = (type) => {
      switch (type) {
        case "bar":
          return <FcBarChart />;
        case "line":
          return <FcLineChart />;
        case "pie":
          return <FcPieChart />;
        case "scatter":
          return <FcScatterPlot />;
        case "graph":
          return <FcMindMap />;
        case "table":
          return <ImTable />;
        default:
          return <FcCloseUpMode />;
      }
    };
    if (tempModel?.properties?.resultsAuthor) {
      tempModel.properties.resultsAuthor.map((k, i) => {
        let type = k.type,
          title = "No title";
        if (type === "chart") type = k.setting.charttype;
        if (k?.setting?.title) title = k.setting.title;
        children.push(
          <Option key={k.id}>
            {chartType(type)} {title}
            {/* {`[${sourcename}_${type}] ${title}`} */}
          </Option>
        );
        if (k.checked === true) deflist.push(k.id);
        return null;
      });
      setChild(children);
      setDefaultlist(deflist);
    }
  };
  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => {
          createMain(tempModel);
          dispatch(globalVariable({ currentStep: currentStep - 1 }));
          dispatch(globalVariable({ nextStep: currentStep }));
        }}
      >
        <Tooltip title="Add Model Summary " placement="right">
          Add Model Summary
        </Tooltip>
      </Menu.Item>

      {/* <Menu.Item key="2" onClick={() => resetData(2)}>
      Reset Source
      </Menu.Item>
      <Menu.Item key="3">
      
      </Menu.Item> */}
    </Menu>
  );
  const ModalContent = (
    <>
      <div
        style={{
          marginBottom: 2,
          color: "#afafaf",
        }}
      >
        <Row gutter={4}>
          <Col flex="auto">
            <Select
              mode="multiple"
              showArrow
              style={{ width: "100%" }}
              placeholder="Please select"
              defaultValue={defaultlist}
              onChange={handleChange}
            >
              {child}
            </Select>
          </Col>
          <Col flex="30px">
            <Dropdown overlay={menu} trigger={["contextMenu"]}>
              <Tooltip title="Create New Chart/Table/Graph">
                <Button
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    setVisible(false);
                    history.push("./author");
                    message.info("Select data for new authoring");
                  }}
                >
                  New
                </Button>
              </Tooltip>
            </Dropdown>
          </Col>
        </Row>
      </div>
    </>
  );
  console.log(tempLayout);
  return (
    <>
      {genExtra()}
      {tempLayout && (
        <GridLay1
          resultsLayout={tempLayout}
          onLayoutChange={onLayoutChange}
          onRemoveItem={onRemoveItem}
          onEditItem={onEditItem}
        >
          {items}
        </GridLay1>
      )}

      <Modal
        title="Select chart/graph/table"
        visible={visible}
        onOk={handleOk}
        width={450}
        confirmLoading={confirmLoading}
        onCancel={(e) => {
          e.stopPropagation();
          setVisible(!visible);
        }}
      >
        <p>{ModalContent}</p>
      </Modal>
    </>
  );
};

export default ModelEdit4;