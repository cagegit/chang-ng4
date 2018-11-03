import {NgGridItemConfig} from "../../ng-grid";
export class LayoutUtil{
  private static MAX_COLS=6;
  private static DRAG_SELECTOR= '.dev-drag';
  public  static  DEFAULT_ITEM_CONFIG={'sizex': LayoutUtil.MAX_COLS, 'sizey': 40,'dragHandle': LayoutUtil.DRAG_SELECTOR} as NgGridItemConfig;
  public  static DEFAULT_ITEM_CONFIG_LIST=[
    [{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 41}],
    [{'dragHandle': '.dev-drag','sizex': 6, 'sizey': 40, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 41}],
    // [{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 80, 'col': 4, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 41}],
    [{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 80, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 41},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 81},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 81}],
    [{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 3, 'sizey': 40, 'col': 4, 'row': 1},{'dragHandle': '.dev-drag','sizex': 6, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 6, 'sizey': 40, 'col': 1, 'row': 41}],
    [{'dragHandle': '.dev-drag','sizex': 6, 'sizey': 40, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 6, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 6, 'sizey': 40, 'col': 1, 'row': 41}],
    [{'dragHandle': '.dev-drag','sizex': 4, 'sizey': 40, 'col': 1, 'row': 1},{'dragHandle': '.dev-drag','sizex': 2, 'sizey': 40, 'col': 5, 'row': 1},{'dragHandle': '.dev-drag','sizex': 2, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 4, 'sizey': 40, 'col': 3, 'row': 41},{'dragHandle': '.dev-drag','sizex': 4, 'sizey': 40, 'col': 1, 'row': 41},{'dragHandle': '.dev-drag','sizex': 2, 'sizey': 40, 'col': 5, 'row': 41}]
  ] as any;
  // public  static CONTAINER_EDIT_CONFIG={'max_cols': LayoutUtil.MAX_COLS, 'auto_resize': true};
  public  static CONTAINER_EDIT_CONFIG={
    'margins': [5],
    // 'draggable': true,
    // 'resizable': true,
    'max_cols': LayoutUtil.MAX_COLS,
    // 'max_rows': 0,
    // 'visible_cols': 0,
    // 'visible_rows': 0,
    // 'min_cols': 1,
    // 'min_rows': 1,
    'col_width': 2,
    'row_height': 2,
    'cascade': 'up',
    'min_width': 50,
    'min_height': 20,
    // 'fix_to_grid': false,
    // 'auto_style': true,
    'auto_resize': true
    // 'maintain_ratio': false,
    // 'prefer_new': false,
    // 'zoom_on_drag': false,
    // 'limit_to_screen': true
  }



  public  static CONTAINER_VIEW_CONFIG={
  'margins': [5],
  'draggable': false,
  'resizable': false,
  'max_cols': LayoutUtil.MAX_COLS,
  // 'max_rows': 0,
  // 'visible_cols': 0,
  // 'visible_rows': 0,
  // 'min_cols': 1,
  // 'min_rows': 1,
  'col_width': 2,
  'row_height': 2,
  'cascade': 'up',
  'min_width': 50,
  'min_height': 20,
  // 'fix_to_grid': false,
  // 'auto_style': true,
  'auto_resize': true
  // 'maintain_ratio': false,
  // 'prefer_new': false,
  // 'zoom_on_drag': false,
  // 'limit_to_screen': true
}


  /**
   * 获取自定义布模版
   * @param itemCount
   * @returns {any[]}
     */
  static getCustom(itemCount : number) : NgGridItemConfig[]{
    let arr=[],i:number,num:number;
    for(i=0;i<itemCount;i++){
      num=i+1;
      let itemConfig=Object.assign({},LayoutUtil.DEFAULT_ITEM_CONFIG) as NgGridItemConfig;
      itemConfig.col=num%LayoutUtil.MAX_COLS==0?LayoutUtil.MAX_COLS:num%LayoutUtil.MAX_COLS;
      itemConfig.row=Math.round(num/LayoutUtil.MAX_COLS);
      console.log("item:",itemConfig);
      arr.push(itemConfig);
    }
    console.log("getCustom:",itemCount,arr);
    return arr;
  }

  /**
   *  获取最新添加的ITEM的配置文件
   * @param num   原始LIST的长度,0开始
   * @returns {any}
     */
  static addItem(length:number=0) : NgGridItemConfig{
    let itemConfig=Object.assign({},LayoutUtil.DEFAULT_ITEM_CONFIG) as NgGridItemConfig;
/*    let num=length+1;
    itemConfig.col=num%LayoutUtil.MAX_COLS==0?LayoutUtil.MAX_COLS:num%LayoutUtil.MAX_COLS;
    itemConfig.row=Math.round(num/LayoutUtil.MAX_COLS);*/
    return itemConfig;
  }



  /**
   * 根据索引ID,获取指定的模版
   * @param index
   * @returns {any}
     */
  static getTemplate(index : number): NgGridItemConfig[]{
    let arr : any[]=[];
    LayoutUtil.DEFAULT_ITEM_CONFIG_LIST[index].slice(0).forEach((tmp : any)=>{
      arr.push(Object.assign({},tmp));
    });
    return arr;
  }

}
