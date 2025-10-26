## Component config

This configures components to be injected into other componenst without the need for passing them in as props.

The idea is that a given compoent will be able to check its config and then 'pull in' the configured components at a given position.

For this to work an index of injectable components will need to be maintained and potential consumers will need to import it.