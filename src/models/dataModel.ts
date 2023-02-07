import { useState } from 'react';
import { getAllGoodsCate } from '@/services/api';
import { localGet } from '@/utils/store';

export default function useAuthModel() {
  const [cateLoading, setCateLoading] = useState(false)
  const [cateData, setCateData] = useState<any>(null)

  const getAllCate = async () => {
    setCateLoading(true)
    setCateData(null)
    const response = await getAllGoodsCate({});
    if (response.code === 200) {
      if ('data' in response) {
        const { data } = response;
        for (let i = 0; i < data.length; i += 1) {
          data[i].key = data[i].id;
        }
        setCateData(data)
      }
    }
  };

  const getCategoryName = (id: number) => {
    let tempName = '-';
    if (cateData && cateData.length > 0) {
      cateData.forEach((item: any) => {
        if (item.id === id) {
          tempName = item.category_name;
        }
      });
    }
    return tempName;
  };

  if (!cateData && !cateLoading && localGet('auctionAdminToken')) {
    getAllCate()
  }

  return {
    getAllCate,
    cateData,
    getCategoryName
  };
}
