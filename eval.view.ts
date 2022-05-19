namespace $.$$ {

	export class $hyoo_js_eval extends $.$hyoo_js_eval {
		
		@ $mol_mem
		code( next?: string ) {
			return this.$.$mol_state_arg.value( 'code', next ) ?? ''
		}
		
		@ $mol_mem
		run( next?: boolean ) {
			return this.$.$mol_state_arg.value( 'run', next?.valueOf && String( next ) ) !== 'false'
		}
		
		@ $mol_mem
		perf() {
			const sources = encodeURIComponent(JSON.stringify([ this.code() ]))
			return `https://perf.js.hyoo.ru/#!sources=${sources}`
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Menu_page(),
				this.Code_page(),
				... this.run() ? [ this.Result_page() ] : [],
			]
		}
		
		@ $mol_mem
		bookmark_list( next?: string[] ) {
			return this.$.$mol_state_local.value( 'snippets', next ) ?? super.bookmark_list()
		}
		
		@ $mol_mem
		bookmark( next?: boolean ) {
			const prev = this.bookmark_list()
			const code = this.code()
			if( next === undefined ) {
				return prev.includes( code )
			} else {
				const list = prev.filter( str => str !== code )
				if( next ) list.unshift( code )
				this.bookmark_list( list )
				return next
			}
		}
		
		@ $mol_mem
		menu() {
			return this.bookmark_list().map( (_, index )=> this.Menu_link( index ) )
		}
		
		menu_link_code( index: number ) {
			return this.bookmark_list()[ index ]
		}
		
		@ $mol_mem_key
		menu_link_title( index: number ) {
			return this.bookmark_list()[ index ]
				.replace( /\n[\s\S]*/, '' )
				.replace( /^\/\/ +/, '' )
		}
		
		@ $mol_mem
		code_enhanced() {
			
			let code = this.code()
			
			code = code.replaceAll(
				/^([ \t]*)(?:const|var|let) +(\w+)/mig,
				( found, indent, name )=> `${indent}this.spy( ()=>[ "${indent}${name} =", ${name} ] )\n${found}`
			)
			
			return code
		}
		
		@ $mol_mem
		execute() {
			
			const console = new Proxy( this.$.console, {
				get: ( target, field )=> {
					
					if( typeof target[ field ] !== 'function' ) return target[ field ]
					
					return ( ... args: any[] )=> {
						this.spy( ()=> [ `${String(field)}:`, ... args ] )
						return target[ field ]( ... args )
					}
					
				}
			} )
			
			return [ '=', $mol_try( ()=> eval( this.code_enhanced() ) ) ]
			
		}
		
		spy( args: ()=> any[] ) {
			Promise.resolve().then( ()=> {
				this.result([ ... this.result(), args() ])
			} )
		}

		@ $mol_mem
		result( next?: any[] ) {
			
			this.code()
			if( next ) return next
			
			return [ this.execute() ]
			
		}
		
		@ $mol_mem
		logs() {
			return this.result().map( (_,index)=> this.Log( index ) )
		}
		
		@ $mol_mem_key
		log( index: number ) {
			return this.result()[ index ]
		}

	}
	
}
