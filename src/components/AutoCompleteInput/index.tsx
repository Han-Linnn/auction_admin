import React, { useState } from 'react';
import { AutoComplete } from 'antd';
import { getGoodsName, getUserName } from '@/services/api';

let timeout: any = null;
let currentValue: string = '';

const AutoCompleteInput: React.FC<{ props: any }> = (props) => {
  const [options, setOptions] = useState<{ /* label: string, */ value: string }[]>([]);
  const { name } = props; // title='拍卖品名称', user='竞拍者'

  const fetch = (value: string) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    const getData = async () => {
      const fn = name === 'user' ? getUserName : getGoodsName;
      const response = await fn({ keyword: value }); // size 返回记录数量
      if (response.code === 200) {
        if (currentValue === value) {
          if ('data' in response) {
            const { data } = response;
            const temp: { /* label: string, */ value: string }[] = [];
            data.forEach((item: any) => {
              temp.push({
                // label: name === 'user' ? item?.name : item,
                value: name === 'user' ? item?.name : item,
              });
            });
            setOptions(temp);
          }
        }
      }
    };

    timeout = setTimeout(getData, 300);
  };

  const onSearch = async (searchText: string) => {
    if (searchText) {
      fetch(searchText);
    } else {
      setOptions([]);
    }
  };

  return <AutoComplete {...props} options={options} onSearch={onSearch} />;
};

export default AutoCompleteInput;
