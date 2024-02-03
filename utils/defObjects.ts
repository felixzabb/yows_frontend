

/** Default data objects for easy use and DRY.*/
export const defScrapeInfoObject : { workflow : WorkflowObject, global_params : GlobalParamsObject, loop : LoopObject, } = {
  workflow : { 
    0 : ["scrape-action", {css_selector: ""}] 
  },
  global_params:{
    website_url : "", wait_time : 10, browser_type : "Edge", amount_actions_local : 1, use_undetected: false
  },
  loop: {
    loop_start_end: [1, 1], iterations: 2, created: false,
  },
};

export const emptyResults : ScraperInfoResults = {
  0 : {
    scrape_runs : {0 : []},
    workflow_executions : {0 : {
      type : "empty-type",
      given_data : {},
      executions_status : "empty-status",
    }}
  }
}