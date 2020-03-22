module.exports = locale => {
  if (
    locale.SiteTouchpoint &&
    locale.SiteTouchpoint !== locale.GTM.SiteTouchpoint
  )
    return new Error(
      `TP does not match. Provided: ${locale.SiteTouchpoint} vs Current: ${locale.GTM.SiteTouchpoint}`
    );
  if (
    locale.GoogleAnalyticsLocal &&
    locale.GoogleAnalyticsLocal !== locale.GTM.GoogleAnalyticsLocal
  )
    return new Error(
      `GA does not match. Provided: ${locale.GoogleAnalyticsLocal} vs Current: ${locale.GTM.GoogleAnalyticsLocal}`
    );
  if (
    locale.GoogleAnalyticsBrand &&
    locale.GoogleAnalyticsBrand !== locale.GTM.GoogleAnalyticsBrand
  )
    return new Error(
      `GA Brand does not match. Provided: ${locale.GoogleAnalyticsBrand} vs Current: ${locale.GTM.GoogleAnalyticsBrand}`
    );
  if (
    locale.GoogleAnalyticsReportingView &&
    locale.GoogleAnalyticsReportingView !==
      locale.GTM.GoogleAnalyticsReportingView
  )
    return new Error(
      `GARV does not match. Provided: ${locale.GoogleAnalyticsReportingView} vs Current: ${locale.GTM.GoogleAnalyticsReportingView}`
    );
  if (
    locale.SiteLocalContainer &&
    locale.SiteLocalContainer !== locale.GTM.SiteLocalContainer
  )
    return new Error(
      `Local GTM does not match. Provided: ${locale.SiteLocalContainer} vs Current: ${locale.GTM.SiteLocalContainer}`
    );
  if (
    locale.ConsentOverlayID &&
    locale.ConsentOverlayID !== locale.GTM.ConsentOverlayID
  )
    return new Error(
      `OT ID does not match. Provided: ${locale.ConsentOverlayID} vs Current: ${locale.GTM.ConsentOverlayID}`
    );
  if (
    locale.FacebookRemarketingID &&
    locale.FacebookRemarketingID !== locale.GTM.FacebookRemarketingID
  )
    return new Error(
      `FB ID does not match. Provided: ${locale.FacebookRemarketingID} vs Current: ${locale.GTM.FacebookRemarketingID}`
    );
};
