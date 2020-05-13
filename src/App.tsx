import React, { useState } from "react";
import data from "./data.json";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";
import ColorHash from "color-hash";
import nullthrows from "nullthrows";
import Immutable from "immutable";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

function getColor(s: string): string {
  return (
    Immutable.Map.of(
      "Case Was Received",
      "#999900",
      "Case Was Approved",
      "#00FF00"
    ).get(s) ?? new ColorHash().hex(s)
  );
}

function App() {
  const [selectedForm, setSelectedForm] = useState<string>("I-129");
  const [selectedCenter, setSelectedCenter] = useState<string>("WAC");

  const entires = Immutable.List(
    Object.entries(data).map(([key, count]) => {
      const [center, year, day, code, form, status, updatedDay] = key.split(
        "|"
      );
      return {
        center,
        year,
        day,
        code,
        form,
        status,
        updatedDay,
        count,
      };
    })
  );

  const selectedEntries = entires.filter(
    (e) => e.form === selectedForm && e.center === selectedCenter
  );

  const updatedIn = new Date(
    1970,
    0,
    selectedEntries.map((e) => Number.parseInt(e.updatedDay)).max()
  );

  const formTypes = entires.map((e) => e.form).toSet();
  const centerNames = entires.map((e) => e.center).toSet();
  const existStatus = selectedEntries.map((e) => e.status).toSet();

  const dataset = selectedEntries
    .groupBy((e) => e.day)
    .map((e, day) => {
      const temp = new Map<string, number>();
      e.forEach((x) => temp.set(x.status, x.count + (temp.get(x.status) ?? 0)));
      return { day: day, ...Object.fromEntries(temp) };
    })
    .toList()
    .sort((a, b) => Number.parseInt(a.day) - Number.parseInt(b.day))
    .toArray();

  const chart = (
    <LineChart width={1440} height={810} data={dataset}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='day' />
      <YAxis />
      <Tooltip
        offset={100}
        itemSorter={(a) => -a.payload[nullthrows(a.dataKey?.toString())]}
      />
      <Legend />
      {Immutable.Set(existStatus)
        .toArray()
        .map((s) => (
          <Line type='linear' dataKey={s} stroke={getColor(s)} />
        ))}
    </LineChart>
  );

  const introduction = (
    <div>
      <h1>USCIS case progress tracker</h1>
      <h2>
        Current Form: {selectedForm}, location: {selectedCenter}, Last Update
        for this form and location: {updatedIn.toDateString()}
      </h2>
      <h3>Help needed for UI and clawer</h3>
      <p>GitHub project: https://github.com/vicdus/uscis-case-statistics/</p>
    </div>
  );

  const QA = (
    <div>
      <h3>Q and A</h3>
      <h4>Q: 怎么用？</h4>
      <p>A: 横坐标是号段，纵坐标是状态对应的数量。</p>
      <h4>Q: 你是谁？</h4>
      <p>A: 我今年抽中了h1b, 在等approve</p>
      <h4>Q: 数据来源？</h4>
      <p>A: 枚举号段下所有可能的case number并爬取USCIS, 保存成文件</p>
      <h4>Q: 没有我的号段的数据？</h4>
      <p>A: 可能需要地里大家一起来爬并更新，稍后放出步骤</p>
      <h4>Q: 为什么是文件？为什么不用数据库？</h4>
      <p>A: 穷、懒</p>
    </div>
  );

  return (
    <div>
      {introduction}
      {chart}
      <FormControl fullWidth={true} component='fieldset'>
        <FormLabel component='legend'>Form Type</FormLabel>
        <RadioGroup
          aria-label='form'
          name='form'
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          {formTypes.toArray().map((f) => (
            <FormControlLabel value={f} control={<Radio />} label={f} />
          ))}
        </RadioGroup>
      </FormControl>
      <FormControl fullWidth={true} component='fieldset'>
        <FormLabel component='legend'>Center</FormLabel>
        <RadioGroup
          aria-label='form'
          name='form'
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
        >
          {centerNames.toArray().map((f) => (
            <FormControlLabel value={f} control={<Radio />} label={f} />
          ))}
        </RadioGroup>
      </FormControl>
      {QA}
    </div>
  );
}

export default App;
