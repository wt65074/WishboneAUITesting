[#-- @ftlvariable name="action" type="com.atlassian.bamboo.ww2.actions.admin.bulk.ManualBuildBulkAction" --]
[#-- @ftlvariable name="" type="com.atlassian.bamboo.ww2.actions.admin.bulk.ManualBuildBulkAction" --]

[#if totalBulkActionErrors == 0]
    [@ww.text name="bulkAction.disablePlan.success" /] [#t]
    [@ww.text name="bulkAction.disablePlan.enable" /]
[#else]
    [@ww.text name="bulkAction.disablePlan.fail" /] [#t]
    [@ww.text name="bulkAction.disablePlan.enable" /]
[/#if]