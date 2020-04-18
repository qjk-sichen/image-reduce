import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'
import LodashId from 'lodash-id'

// 这边用lowdb实现了一个数据库用它来接替文件
// 通过lodash-id这个插件可以很方便地为每个新增的数据自动加上一个唯一标识的id字段。

// lowdb本质上就是通过fs来读写JSON文件实现的
// remote模块是electron为了让一些原本在Main进程里运行的模块也能在renderer进程里运行而创建的。以下说几个我们会用到的。
// 在electron-vue里内置了vue-electron这个模块，可以在vue里很方便的使用诸如this.$electron.remote.xxx来使用remote的模块。

const home = process.env.HOME || (process.env.HOMEDRIVE + process.env.HOMEPATH);
const STORE_PATH = `${home}/.upload_data` // 存到用户目录

// 开发环境下路径已经存在，而在生产环境下这个路径是没有的，所以会报错，这边要创建一个
if (!fs.pathExistsSync(STORE_PATH)) {
  fs.mkdirpSync(STORE_PATH)
}
const adapter = new FileSync(path.join(STORE_PATH, '/data.json')) // 初始化lowdb读写的json文件名以及存储路径
const db = Datastore(adapter) // lowdb接管该文件

db._.mixin(LodashId) // 初始化LodashId，通过._mixin()引入到db对象中
// 初始化数据
if (!db.has('imgList').value()) {
  db.set('imgList', []).write()
}
if (!db.has('imgPressList').value()) {
  db.set('imgPressList', []).write()
}

// 插入压缩结果
const insert = (filename, data) => {
  db.read().get(filename).insert(data).write()
}
// 删除结果
const remove = (filename, by) => {
  db.read().get(filename).remove(by).write()
}

// 更新内容
const update = (filename, by, data) => {
  db.read().get(filename).find(by).assign(data).write()
}

// 读取视图列表
const find = (filename, data) => {
  if (data) {
    return db.read().get(filename).find(data).value()
  } else {
    return db.read().get(filename).value()
  }
}
// 清除所有
const removeAll = (filename) => {
  db.read().get(filename).remove().write()
}

export default {
  insert,
  remove,
  removeAll,
  update,
  find
} //暴露出去db