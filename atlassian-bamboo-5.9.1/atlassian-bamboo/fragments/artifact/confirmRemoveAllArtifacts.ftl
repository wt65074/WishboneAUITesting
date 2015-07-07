[#-- @ftlvariable name="action" type="com.atlassian.bamboo.ww2.actions.build.admin.RemoveBuildArtifacts" --]
[#-- @ftlvariable name="" type="com.atlassian.bamboo.ww2.actions.build.admin.RemoveBuildArtifacts" --]

[#if fn.isChain(immutablePlan)]
    [#assign action='removeChainArtifacts'/]
    [#assign namespace='/chain/result'/]
    [#assign planText=''/]
[#else]
    [#assign action='removeBuildArtifacts'/]
    [#assign namespace='/build/admin'/]
    [@ww.text id='planText' name='job.common.title'/]
[/#if]

[@ww.form action=action namespace=namespace cssClass='bambooAuiDialogForm']
    [@ww.text name='artifact.removeAll.confirm' ]
        [@ww.param]${planText}[/@ww.param]
    [/@ww.text]

    [@ww.hidden name='planKey' /]
    [@ww.hidden name='buildNumber' /]
[/@ww.form]