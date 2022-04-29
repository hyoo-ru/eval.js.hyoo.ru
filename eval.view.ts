namespace $.$$ {

	export class $hyoo_js_eval extends $.$hyoo_js_eval {
		
		code( next?: string ) {
			return this.$.$mol_state_arg.value( 'code', next ) ?? ''
		}
		
		@ $mol_mem
		result() {
			return String( this.$.$mol_js_eval( this.code() ) )
		}

	}
	
}
