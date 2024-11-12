# Dynamic Custom Block with Bindings Experiment

This block is an experiment to test the use case of dynamic blocks in the context of block bindings. It will only work when tested with the PR https://github.com/WordPress/wordpress-develop/pull/7597, which allows bindings to be processed for the custom block.

The block is meant to connect to date custom fields and render them differently depending on the field key. For the moment, it just works with two example custom fields, which are included: `release_date` and `publish_date`.

After installing, use the following block markup in the editor and view the published post to see the blocks in action. Note that an editor UI has not been implemented.

```
<!-- wp:create-block/date-block {"metadata":{"bindings":{"content":{"source":"core/post-meta","args":{"key":"publish_date"}}}}} /-->

<!-- wp:create-block/date-block {"metadata":{"bindings":{"content":{"source":"core/post-meta","args":{"key":"release_date"}}}}} /-->
```

When viewing the published post, you should see the output for these blocks formatted slightly differently.
