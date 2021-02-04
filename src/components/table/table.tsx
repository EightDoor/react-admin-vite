import React, { useState } from 'react'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { http } from '@/utils/request'
import { TableResult } from '@/type/commonType'
import { useMount } from 'ahooks'
import CommonButton, { CommonButtonType } from '@/components/button/button'
import DelPopConfim from '@/components/button/delPopConfim'

interface Props<T> {
  // 表格行
  columns: ProColumns<T, 'text'>[]
  // 索引key
  rowKey?: string
  // 标题
  headerTitle?: string
  // 顶部的操作栏
  toolBar?: React.ReactNode[]
  // 地址
  url: string
  // 排序
  sort?: string
  // 操作栏
  actions?: TableActions[]
  actionFun?: (val: string) => void
}
export interface TableActions {
  title: string
  type?: 'default' | 'del'
  key: string
}
function CommonTable<T>(props: Props<T>) {
  const [columns, setColumns] = useState<ProColumns<T, 'text'>[]>([])
  const ToolBar = () => {
    let list: React.ReactNode[] = []
    if (props.toolBar) {
      list = props.toolBar
    }
    return list
  }
  useMount(() => {
    const cols: ProColumns<T, 'text'> = {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, row, index, action) => {
        let list: JSX.Element[] = []
        const defaultButton: CommonButtonType[] = []
        if (props.actions && props.actions.length > 0) {
          props.actions.forEach((item) => {
            if (item.type === 'del') {
              list.push(
                <DelPopConfim
                  ok={() => {
                    if (props.actionFun) {
                      props.actionFun(item.key)
                    }
                  }}
                  title={item.title}
                />,
              )
            } else {
              defaultButton.push({
                title: item.title,
                key: item.key,
              })
            }
          })
        }
        list = [
          <CommonButton
            key="button"
            change={(val: string) => {
              if (props.actionFun) {
                props.actionFun(val)
              }
            }}
            list={defaultButton}
          />,
          ...list,
        ]
        return list
      },
    }
    const list: ProColumns<T, 'text'>[] = props.columns
    if (props.actions) {
      console.log(props.actions)
      list.push(cols)
    }
    setColumns(list)
  })
  return (
    <>
      <ProTable<T>
        columns={columns}
        rowKey={props.rowKey ?? 'id'}
        search={{
          labelWidth: 'auto',
        }}
        request={async (params, sorter, filter) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const searchData: any = {}
          for (const key in params) {
            if (key !== 'current' && key !== 'pageSize') {
              searchData[key] = params[key]
            }
          }
          console.log(params, sorter, filter)
          const page = params.current ?? 1
          const limit = params.pageSize ?? 10
          return new Promise((resolve, reject) => {
            http
              .get(props.url, {
                params: {
                  page,
                  limit,
                  sort: props.sort ?? 'createdAt,DESC',
                  s: searchData,
                },
              })
              .then((res: TableResult) => {
                resolve({
                  data: res.data.data,
                  success: true,
                  total: res.data.total,
                })
              })
              .catch((error) => {
                reject(error)
              })
          })
        }}
        pagination={{ pageSize: 10 }}
        dateFormatter="string"
        headerTitle={props.headerTitle}
        toolBarRender={() => ToolBar()}
      />
    </>
  )
}
export default CommonTable
