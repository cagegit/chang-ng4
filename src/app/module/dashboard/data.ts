/**
 * Created by fengjj on 2016/12/28.
 */
export const PAGES = [
  {
    pageId:'page1',
    pageName:'panel1',
    panels:[
      {
        panelId:'panel1',
        panelType:0,
        panelX:0,
        panelY:0,
        panelW:6,
        panelH:2
      },
      {
        panelId:'panel2',
        panelType:1,
        panelX:6,
        panelY:0,
        panelW:6,
        panelH:2
      },
      {
        panelId:'panel3',
        panelType:2,
        panelX:0,
        panelY:2,
        panelW:6,
        panelH:2
      },
      {
        panelId:'panel4',
        panelType:3,
        panelX:6,
        panelY:2,
        panelW:6,
        panelH:2
      }
    ]

  }
]
export const DASHBOARD = {
  Dashboard: {
    dashboardID: 'dashboard1',
    dashboardName: 'dashboard name',
    content:JSON.stringify(PAGES),
    dataSetIDs:[]
  }
}
